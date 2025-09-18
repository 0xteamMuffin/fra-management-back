import { Request, Response } from "express";
import OpenAI from "openai";
import { AuthRequest } from "../middleware/auth.middleware";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getDSSSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    // const userId = req.user?.id;
    const { assetMapping } = req.body;

    // TODO: ignore auth for internals
    // if (!userId) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    // const updatedClaim = await db.fRAClaim.update({
    //   where: { id },
    //   data: {
    //     status: "Verified",
    //     verifiedByUserId: userId,
    //   },
    // });

    let aiResponse: string | null = null;
    if (assetMapping) {
      const prompt = `
      You are an expert Decision Support System (DSS) specialized in rural development, social welfare, 
and government scheme alignment. Your role is to analyze FRA (Forest Rights Act) claim holders 
and recommend matching CSS (Centrally Sponsored Schemes) such as DAJGUA, Jal Shakti, etc., 
to maximize benefits.

Here is the information we have:
        ${JSON.stringify(assetMapping, null, 2)}


Your tasks are:
1. Recommend which CSS schemes (like DAJGUA, Jal Shakti, MNREGA, PM-KUSUM, etc.) 
   this household/village is eligible for, based on FRA status and assets.
2. Prioritize interventions (e.g., borewell, irrigation, soil fertility programs) 
   if village has low water index or other vulnerabilities.
3. Suggest how rule-based logic (eligibility criteria) combines with AI reasoning 
   for this recommendation.
4. Return the result as a **structured JSON** with the following format:

{
  "schemeRecommendations": [
    { "schemeName": "DAJGUA", "eligibilityReason": "...", "priority": "High/Medium/Low" }
  ],
  "interventions": [
    { "intervention": "Borewell under Jal Shakti", "reason": "Low water index in region", "urgency": "High" }
  ],
  "additionalNotes": "..."
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a financial assistant." },
          { role: "user", content: prompt },
        ],
      });

      aiResponse = completion.choices[0]?.message?.content ?? null;
    }

    return res.status(200).json({
      // claim: updatedClaim,
      suggestions: aiResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch suggestions" });
  }
};
