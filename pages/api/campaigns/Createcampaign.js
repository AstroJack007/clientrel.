import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import connect from "../../../libs/mongodb";
import Campaign from "../../../models/communicationLog";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Only POST method is allowed" });
    }

    try {
        const { rules, message, audience } = req.body;

        if (!rules || !message || audience == null) {
            return res.status(400).json({ message: "Rules, message, and audience are required" });
        }

        const audienceSize = audience;

        await connect();

        // failed must be <= 100 and not exceed audience size
        const maxFailed = Math.min(100, audienceSize);
        const failed = Math.floor(Math.random() * (maxFailed + 1)); // 0..maxFailed
        const sent = audienceSize - failed;

        // Build deliveryDetails with the exact counts; customerId optional
        const deliveryDetails = Array.from({ length: audienceSize }, (_, i) => ({
            status: i < sent ? 'SENT' : 'FAILED',
        }));

        const newLog = new Campaign({
            audienceQuery: JSON.stringify(rules),
            message,
            audienceSize,
            status: 'SENT',
            createdBy: session.user.email,
            deliveryDetails,
        });

        await newLog.save();

        return res.status(201).json({
            message: 'Campaign Launched Successfully !!',
            logId: newLog._id,
            details: { sent, failed }
        });
    } catch (err) { 
        console.error("Error launching campaign: ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}