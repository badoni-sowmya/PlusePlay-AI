"use client";

import { Bot, SendHorizontal } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MatchState, Preferences } from "@/lib/types";

type ChatMessage = { role: "assistant" | "user"; text: string };

export function CoachChat({ match, preferences }: { match: MatchState; preferences: Preferences }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Ask me why momentum shifted, who is overperforming, or what tactical move comes next." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function askCoach() {
    if (!input.trim() || loading) return;
    const userMessage = input;
    setInput("");
    setMessages((items) => [...items, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, match, preferences })
      });
      const data = (await response.json()) as { text?: string };
      const assistantMessage: ChatMessage = {
        role: "assistant",
        text: data.text ?? "Coach AI is reading the match state. Ask again in a second."
      };
      setMessages((items) => [...items, assistantMessage].slice(-5));
    } catch (e) {
      const offlineMessage: ChatMessage = { role: "assistant", text: "Coach offline. Try again." };
      setMessages((items) => [...items, offlineMessage].slice(-5));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach AI Chat</CardTitle>
        <Bot className="h-4 w-4 text-cyan-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-52 space-y-2 overflow-y-auto pr-1 no-scrollbar">
          {messages.map((message, index) => (
            <div key={index} className={`rounded-lg p-3 text-sm leading-5 ${message.role === "assistant" ? "bg-cyan-300/10 text-cyan-50" : "bg-white/10 text-white"}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && askCoach()}
            placeholder="Ask Coach AI..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border border-white/12 bg-black/28 px-3 text-sm text-white outline-none focus:border-cyan-200/60 disabled:opacity-50"
          />
          <Button size="icon" onClick={askCoach} disabled={loading} aria-label="Ask Coach AI"><SendHorizontal className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
