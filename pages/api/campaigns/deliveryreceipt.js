import connect from "../../../libs/mongodb";
import Campaign from "../../../models/communicationLog";
import mongoose from "mongoose";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { campaignId, customerId, status } = req.body;
        await connect();

        // Ensure proper ObjectId matching in update filter
        const campaignObjectId = mongoose.Types.ObjectId.isValid(campaignId)
            ? new mongoose.Types.ObjectId(campaignId)
            : campaignId;
        const customerObjectId = mongoose.Types.ObjectId.isValid(customerId)
            ? new mongoose.Types.ObjectId(customerId)
            : customerId;

        await Campaign.updateOne(
            { _id: campaignObjectId, "deliveryDetails.customerId": customerObjectId },
            { "$set": { "deliveryDetails.$.status": status } }
        );

        res.status(200).json({ message: 'Delivery receipt received' });
    } catch (err) {
        console.error("Error processing delivery receipt: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}