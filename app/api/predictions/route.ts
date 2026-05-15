import { NextResponse } from "next/server";

type PredictionEntry = {
  id: string;
  matchId: string;
  category: string;
  prediction: string;
  createdAt: string;
};

const predictionsStore: PredictionEntry[] = [];

export async function POST(request: Request) {
  try {
    console.log(`[api/predictions] hit ${new Date().toISOString()}`);
    const { matchId, category, prediction } = await request.json();
    if (!matchId || !prediction) {
      return NextResponse.json({ success: false, error: "missing fields" }, { status: 400 });
    }

    const entry: PredictionEntry = {
      id: `p-${Date.now()}`,
      matchId,
      category: category || "general",
      prediction,
      createdAt: new Date().toISOString(),
    };
    predictionsStore.push(entry);

    const confidence = Math.round(50 + Math.random() * 50);

    return NextResponse.json({ success: true, confidence, entry });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
