import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { buildInsightPrompt, localInsights } from "@/lib/ai";
import type { MatchState, Preferences } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log(`[api/insights] hit ${new Date().toISOString()}`);
  const body = (await request.json()) as { match: MatchState; preferences: Preferences };
  const prompt = buildInsightPrompt(body.match, body.preferences);

  try {
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6
      });
      return Response.json(JSON.parse(completion.choices[0]?.message.content ?? "{}"));
    }

    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return Response.json(JSON.parse(result.response.text().replace(/```json|```/g, "").trim()));
    }
  } catch {
    return Response.json(localInsights(body.match, body.preferences));
  }

  return Response.json(localInsights(body.match, body.preferences));
}
