import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "../auth/[...nextauth]";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
const Groqprompt = `
You are an expert CRM assistant. Convert a user's natural language query into rules.
Respond with ONLY valid JSON using this schema:
{
  "logic": "AND" | "OR" | "MIXED"
  "rules": [
    { "field": "totalSpends" | "visitCount" | "lastSeen", "operator": "gt" | "lt" | "eq", "value": number | "YYYY-MM-DD" },
     { "field": "totalSpends" | "visitCount" | "lastSeen", "operator": "gt" | "lt" | "eq", "value": number | "YYYY-MM-DD" },
      { "field": "totalSpends" | "visitCount" | "lastSeen", "operator": "gt" | "lt" | "eq", "value": number | "YYYY-MM-DD" }

  ]
  "connectors":['AND','OR'] || ['AND'] || ['OR'] || ['OR','AND']
}
-if logic is "mixed" then return multiple logics that are being used else if only single logic is being used then return the logic being used
- Fields: totalSpends (number), visitCount (number), lastSeen (date YYYY-MM-DD)
- Operators: gt, lt, eq
- For date phrases (e.g., "last 6 months"), compute from today (September 14, 2025).
  - "in the last 6 months" => lastSeen lt "2025-03-14"
  - "more than 30 days ago" => lastSeen lt "2025-08-15"
- Do not include any extra keys. Ensure logic is present and rules is a non-empty array.
`;


export default async function generateRules(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only Post Method Allowed" });
  }
  try {
    const { prompt } = req.body;
    if(!prompt){
        return res.status(400).json({message:"Prompt Required"});
    }

    const chat = await client.chat.completions.create({
      messages: [
        { role: "system", content: Groqprompt },
        { role: "user", content: prompt },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
      const result = JSON.parse(chat.choices[0].message.content || "{}");
     
      return res.status(200).json(result);
    }catch(err) {
        console.error('Error with Groq AI : ',err);
        return res.error(500).json({message : "Failed to generate rules"});
    }
  } 

