import connect from "../../../libs/mongodb";
import Campaign from "../../../models/communicationLog";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { campaignId, customerId, status } = req.body;
        await connect();

        await Campaign.updateOne(
            { "_id": campaignId, "deliveryDetails.customerId": customerId },
            { "$set": { "deliveryDetails.$.status": status } }
        );

        res.status(200).json({ message: 'Delivery receipt received' });
    } catch (err) {
        console.error("Error processing delivery receipt: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}