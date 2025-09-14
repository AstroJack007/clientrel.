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
  "logic": "AND" | "OR" | "MIXED",
  "rules": [
    { "field": "totalSpends" | "visitCount" | "lastSeen", "operator": "gt" | "lt" | "eq", "value": number | "YYYY-MM-DD" }
  ],
  "connectors": ["AND" | "OR", ...] // length must be rules.length - 1, representing the boolean operator BETWEEN sequential rules
}

- Fields: totalSpends (number), visitCount (number), lastSeen (date YYYY-MM-DD)
- Operators: gt, lt, eq
- For date phrases (e.g., "last 6 months"), compute from today (September 14, 2025).
  - "in the last 6 months" => lastSeen lt "2025-03-14"
  - "more than 30 days ago" => lastSeen lt "2025-08-15"
- Map synonyms: spend/spends/amount => totalSpends, visits/visit => visitCount, inactive/dormant => lastSeen with an appropriate lt date.
- Handle currency markers like INR 10,000 by outputting numeric value 10000.
- If the user's text implies both AND and OR, do NOT collapse to a single logic; set logic to "MIXED" and provide an exact connectors array matching each join.
- Do not include any extra keys. Ensure logic is present, rules is a non-empty array, and connectors length equals rules.length - 1.
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
  const { prompt, preferredLogic, connectorsHint } = req.body;
    if(!prompt){
        return res.status(400).json({message:"Prompt Required"});
    }
    const logicHint = typeof preferredLogic === 'string' ? preferredLogic.toUpperCase() : 'AND';

    const chat = await client.chat.completions.create({
      messages: [
        { role: "system", content: Groqprompt },
  { role: "system", content: `Preferred logical operator: ${logicHint}. Use this as a default when ambiguous. If both AND and OR appear or are implied, set logic to MIXED and output an exact connectors array.`},
  ...(Array.isArray(connectorsHint) && connectorsHint.length ? [{ role: "system", content: `When mapping clauses, preserve the user's connector sequence: ${connectorsHint.join(' ')} (length=${connectorsHint.length}).` }] : []),
        { role: "user", content: prompt },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
      const raw = chat.choices?.[0]?.message?.content || "{}";
      let result = {};
      try { result = JSON.parse(raw); } catch {}

      // Fallback: derive connectors from the prompt if missing or wrong length
      const ruleCount = Array.isArray(result?.rules) ? result.rules.length : 0;
      if (ruleCount > 1) {
        let connectors = Array.isArray(result?.connectors) ? result.connectors : null;
        const desiredLen = ruleCount - 1;
        const normalize = (arr) => arr.map((c) => (typeof c === 'string' && c.toUpperCase() === 'OR' ? 'OR' : 'AND'));
        if (!connectors || connectors.length !== desiredLen) {
          const found = Array.isArray(connectorsHint) && connectorsHint.length ? connectorsHint.map((m)=> (typeof m === 'string' && m.toUpperCase() === 'OR' ? 'OR' : 'AND')) : (prompt.match(/\b(?:and|or)\b/gi) || []).map((m) => m.toUpperCase());
          let derived = normalize(found);
          if (derived.length < desiredLen) {
            const fill = (typeof result?.logic === 'string' ? result.logic : logicHint).toUpperCase();
            while (derived.length < desiredLen) derived.push(fill === 'OR' ? 'OR' : 'AND');
          }
          result.connectors = derived.slice(0, desiredLen);
          if (!result.logic || (result.logic !== 'AND' && result.logic !== 'OR' && result.logic !== 'MIXED')) {
            // If mixed appears in prompt or we found both types, set MIXED
            const hasAnd = result.connectors.includes('AND');
            const hasOr = result.connectors.includes('OR');
            result.logic = hasAnd && hasOr ? 'MIXED' : (result.connectors[0] || 'AND');
          }
        } else {
          result.connectors = normalize(connectors);
        }
      } else {
        // Single or zero rule: connectors should be empty
        result.connectors = [];
      }

      console.log(result);
      return res.status(200).json(result);
    }catch(err) {
        console.error('Error with Groq AI : ',err);
        return res.status(500).json({message : "Failed to generate rules"});
    }
  } 

