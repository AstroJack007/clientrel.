import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import connect from "../../../libs/mongodb";
import Campaign from "../../../models/communicationLog";
import Customer from "../../../models/customer";
import { MongoQuery } from "../../../libs/queryBuilder";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Only POST method is allowed" });
    }

    try {
        const { rules, message, logic, connectors } = req.body;

        // Build a safe base URL for internal calls (works in prod, preview, and dev)
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const envBase = process.env.NEXTAUTH_URL || '';
        const origin = (envBase ? envBase : `${proto}://${host}`).replace(/\/$/, '');

        if (!rules || !message) {
            return res.status(400).json({ message: "Rules and message are required" });
        }

        await connect();
        const mongoQuery = MongoQuery({ rules, logic, connectors });
        const audience = await Customer.find(mongoQuery).select('_id name').lean();
        const audienceSize = audience.length;

        const newCampaign = new Campaign({
            audienceQuery: JSON.stringify({ rules, logic, connectors }),
            message,
            audienceSize,
            status: 'PROCESSING',
            createdBy: session.user.email,
            deliveryDetails: audience.map(customer => ({
                customerId: customer._id,
                status: 'PENDING',
            })),
        });

        await newCampaign.save();

        // Concurrency-limited vendor dispatch to avoid overwhelming serverless in prod
        const CONCURRENCY = 20;
        let idx = 0;
        const sendToVendor = async (customer) => {
            const personalizedMessage = message.replace('{{name}}', customer.name);
            return fetch(`${origin}/api/vendor/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: newCampaign._id,
                    customerId: customer._id,
                    message: personalizedMessage,
                }),
            });
        };

        const workers = Array.from({ length: Math.min(CONCURRENCY, audience.length) }, async () => {
            while (idx < audience.length) {
                const current = idx++;
                try {
                    await sendToVendor(audience[current]);
                } catch (e) {
                    // let fallback handle unacknowledged items
                }
            }
        });

        await Promise.all(workers);

        // Brief grace period for final receipts to arrive
        await new Promise((r) => setTimeout(r, 500));

        // Fallback: mark any remaining PENDING deliveries as FAILED
        await Campaign.updateOne(
            { _id: newCampaign._id },
            { $set: { 'deliveryDetails.$[d].status': 'FAILED' } },
            { arrayFilters: [{ 'd.status': 'PENDING' }] }
        );

        // Mark campaign as SENT to denote completion of dispatch phase
        await Campaign.updateOne({ _id: newCampaign._id }, { $set: { status: 'SENT' } });


        return res.status(201).json({
            message: 'Campaign Launched Successfully !!',
            logId: newCampaign._id,
        });

    } catch (err) {
        console.error("Error launching campaign: ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}