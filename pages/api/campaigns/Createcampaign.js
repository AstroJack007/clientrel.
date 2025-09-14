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

        for (const customer of audience) {
            const personalizedMessage = message.replace('{{name}}', customer.name);
            fetch(`${process.env.NEXTAUTH_URL}/api/vendor/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: newCampaign._id,
                    customerId: customer._id,
                    message: personalizedMessage,
                }),
            });
        }
        setTimeout(async () => {
            await Campaign.updateOne({_id: newCampaign._id }, { $set: { status: 'SENT' } });
        }, 5000); 


        return res.status(201).json({
            message: 'Campaign Launched Successfully !!',
            logId: newCampaign._id,
        });

    } catch (err) {
        console.error("Error launching campaign: ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}