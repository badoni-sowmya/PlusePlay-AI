import { NextResponse } from "next/server";
import { openingPoll } from "@/lib/mock-data";

type PollsStore = Record<string, number[]>;

// Simple in-memory store for demo purposes
const pollsStore: PollsStore = {
  [openingPoll.id]: openingPoll.options.map((o) => o.votes),
};

export async function POST(request: Request) {
  try {
    console.log(`[api/polls/vote] hit ${new Date().toISOString()}`);
    const { pollId, optionIndex } = await request.json();
    if (typeof optionIndex !== "number") {
      return NextResponse.json({ success: false, error: "invalid optionIndex" }, { status: 400 });
    }

    if (!pollsStore[pollId]) {
      // initialize with zeros if unknown poll
      pollsStore[pollId] = [0, 0, 0];
    }

    if (optionIndex < 0 || optionIndex >= pollsStore[pollId].length) {
      return NextResponse.json({ success: false, error: "option out of range" }, { status: 400 });
    }

    pollsStore[pollId][optionIndex] += 1;

    return NextResponse.json({ success: true, options: pollsStore[pollId] });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
