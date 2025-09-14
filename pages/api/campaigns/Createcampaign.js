import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import connect from "../../../libs/mongodb";
import customer from "../../../models/customer";
import Campaign from "../../../models/communicationLog"
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
        const { rules, message } = req.body;

        if (!rules || !message) {
            return res.status(400).json({ message: "Rules and message are required" });
        }

        await connect();
        const mongoquery = MongoQuery(rules);
        const audience = await customer.find(mongoquery).lean(); 
        if (audience.length === 0) {
            return res.status(404).json({ message: "No Customers found for the given criteria" });
        }

        const newLog = new Campaign({
            audienceQuery: JSON.stringify(rules),
            message: message,
            audienceSize: audience.length,
            status: 'PROCESSING',
            createdBy: session.user.email,
        });

        const deliveryDetails = [];
        for (const cus of audience) {
            const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
        
            deliveryDetails.push({ customerId: cus._id, status: status });
        }

        newLog.deliveryDetails = deliveryDetails;
        newLog.status = 'SENT';
        await newLog.save();

        return res.status(201).json({
            message: 'Campaign Launched Successfully !!',
            logId: newLog._id,
            details: {
                sent: deliveryDetails.filter(d => d.status === 'SENT').length,
                failed: deliveryDetails.filter(d => d.status === 'FAILED').length,
            }
        });
    } catch (err) { 
        console.error("Error launching campaign: ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}