import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { hypeLine } from "@/lib/ai";
import type { MatchEvent, MatchState, Preferences } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log(`[api/hype] hit ${new Date().toISOString()}`);
  const body = (await request.json()) as { match: MatchState; event?: MatchEvent; preferences: Preferences };
  const prompt = `Write one dramatic live sports second-screen reaction in ${body.preferences.tone} tone.
Score ${body.match.home.name} ${body.match.home.score}-${body.match.away.score} ${body.match.away.name}.
Latest event: ${body.event ? `${body.event.title}. ${body.event.detail}` : "steady pressure"}.
Keep it under 38 words.`;

  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: true,
      temperature: 0.9
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content ?? ""));
          }
          controller.close();
        }
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" });
    const result = await model.generateContentStream(prompt);
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const chunk of result.stream) {
            controller.enqueue(encoder.encode(chunk.text()));
          }
          controller.close();
        }
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const fallback = hypeLine(body.event, body.match, body.preferences);
  return streamWords(fallback);
}

function streamWords(text: string) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for (const word of text.split(" ")) {
          controller.enqueue(encoder.encode(`${word} `));
          await new Promise((resolve) => setTimeout(resolve, 45));
        }
        controller.close();
      }
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
