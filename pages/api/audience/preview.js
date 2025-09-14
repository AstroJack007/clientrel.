import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connect from "../../../libs/mongodb"; 
import customer from "../../../models/customer";
import { MongoQuery } from "../../../libs/queryBuilder";

export default async function handler(req, res) {

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { rules, connectors, logic, operator, conjunction, combine } = req.body;

    // Derive connectors from legacy logic keys if not explicitly provided
    let joins = Array.isArray(connectors) ? connectors : null;
    if (!joins && (logic || operator || conjunction || combine)) {
      const hint = (logic || operator || conjunction || combine || 'AND').toString().toUpperCase();
      // create a joins array of uniform hint for N-1 gaps
      joins = Array.isArray(rules) ? new Array(Math.max(0, rules.length - 1)).fill(hint) : [];
    }

    const mongoQuery = MongoQuery(rules, joins);

   
    await connect();
    const audienceSize = await customer.countDocuments(mongoQuery);
    
    
    return res.status(200).json({ audienceSize });

  } catch (error) {
    console.error("Error fetching audience size:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
