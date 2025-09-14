import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "../auth/[...nextauth]";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const Groqprompt = `
You are an expert CRM assistant. Your task is to convert a user's natural language query into a structured JSON object of rules. You must respond with only valid JSON.

The available fields for rules are:
- 'totalSpends' (a number)
- 'visitCount' (a number)
- 'lastSeen' (a date in YYYY-MM-DD format)

The available operators are:
- 'gt' (greater than)
- 'lt' (less than)
- 'eq' (equal to)

Analyze the user's text and construct a JSON object containing an array of rule objects.
For date-based queries like "in the last 6 months", calculate the approximate date from today. Today's date is September 14, 2025.
For example, "in the last 6 months" means the lastSeen date should be 'lt' (less than) '2025-03-14'.
Another example, "more than 30 days ago" means the lastSeen date should be 'lt' '2025-08-15'.
`;

export default async function generateRules(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!sessison) {
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

   const chat=await groq.chat.completions.create({
        messages: [
          { role:'system',content:Groqprompt},
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "openai/gpt-oss-20b",
        temperature:0.2,
        response_format:{type:'json_object'}
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return res.status(200).json(result);
    }catch(err) {
        console.error('Error with Groq AI : ',err);
        return res.error(500).json({message : "Failed to generate rules"});
    }
  } 

