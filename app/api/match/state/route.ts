import { NextResponse } from "next/server";
import { initialMatch } from "@/lib/mock-data";

export async function GET() {
  try {
    console.log(`[api/match/state] hit ${new Date().toISOString()}`);
    // lightweight, deterministic realtime-ish snapshot based on wall clock
    const ticks = Math.floor(Date.now() / 2600);
    const clock = initialMatch.clock + (ticks % 1000) * 18;
    const momentum = Math.max(0, Math.min(100, initialMatch.momentum + Math.round(Math.sin(ticks * 0.42) * 6)));
    const crowd = Math.max(10, Math.min(100, initialMatch.crowd + Math.round(Math.cos(ticks * 0.17) * 4)));

    const match = {
      ...initialMatch,
      clock,
      momentum,
      crowd,
    };

    return NextResponse.json({ success: true, match });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
