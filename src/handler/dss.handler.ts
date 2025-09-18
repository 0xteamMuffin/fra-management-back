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
You are an expert Decision Support System (DSS) advisor for rural development 
and welfare scheme alignment. 

You have asset allocation data from FRA claim holders. 
Based on this, recommend relevant CSS (Centrally Sponsored Schemes) such as 
DAJGUA, Jal Shakti / Jal Jeevan, MNREGA, PM-KUSUM, etc.

RULES (must strictly follow):
1. Recommend Jal Shakti / Jal Jeevan interventions (e.g., borewell, irrigation, 
   drinking water pipelines) if:
   - water assets are below 20% OR
   - water index is explicitly marked as "Low".
   ⚠️ Even if water = 0, always suggest Jal Shakti / Jal Jeevan.
   - If water % >= 30%, do NOT suggest Jal Shakti interventions.
2. Recommend DAJGUA if land share is >= 20% (land-focused households).
3. Recommend MNREGA for additional income support if land < 15% or no stable asset is present.
4. Recommend PM-KUSUM if significant land is available for solar pumps (>25% land).
5. Avoid duplicating schemes — only return what is logically justified.
6. Always explain clearly why a scheme is (or is not) recommended, linking back to the 
   provided asset stats.

Input asset mapping:
${JSON.stringify(assetMapping, null, 2)}

Your tasks:
1. Recommend eligible CSS schemes with clear eligibility reasons.
2. Suggest prioritized interventions ONLY if there is a genuine need 
   (based on asset % thresholds).
3. Return results strictly as formatted JSON:

{
  "schemeRecommendations": [
    { "schemeName": "DAJGUA", "eligibilityReason": "...", "priority": "High/Medium/Low" }
  ],
  "interventions": [
    { "intervention": "X", "reason": "Y", "urgency": "High/Medium/Low" }
  ],
  "additionalNotes": "..."
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a DSS engine combining rule-based logic with reasoning",
          },
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
