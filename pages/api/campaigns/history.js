import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connect from "../../../libs/mongodb";
import Campaign from "../../../models/Campaign";

export default async function GetcampaignHistory(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET method is allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connect();
    const campaigns = await Campaign.find({
      createdBy: session.user.email,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ campaigns });
  } catch (err) {
    console.error("Error fetching campaign history:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
