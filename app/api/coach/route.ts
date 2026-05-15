import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { MatchState, Preferences } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message: string;
    match: MatchState;
    preferences: Preferences;
  };

  const prompt = `You are Coach AI in a live sports second-screen app called PulsePlay AI.
The user is asking: "${body.message}"
Current score: ${body.match.home.name} ${body.match.home.score}-${body.match.away.score} ${body.match.away.name}
Favorite team: ${body.match[body.preferences.favoriteTeam].name}
Match momentum: ${Math.round(body.match.momentum)}/100
Recent events: ${body.match.events.slice(0, 3).map((e) => `${e.minute}' ${e.title}`).join("; ")}
Your tone: ${body.preferences.tone}

Give a short, tactical response focused on the favorite team's perspective. Under 50 words.`;

  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 120
    });
    return Response.json({
      text: completion.choices[0]?.message.content ?? "Coach is thinking..."
    });
  }

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return Response.json({
      text: result.response.text()
    });
  }

  // Fallback response
  const fallback = {
    text: `${body.match[body.preferences.favoriteTeam].name} should attack down the flank. Current momentum favors us at ${Math.round(body.match.momentum)}%.`
  };
  return Response.json(fallback);
}
