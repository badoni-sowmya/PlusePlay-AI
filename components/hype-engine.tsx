"use client";

import { Bot, Clapperboard, MessageCircle, RefreshCw, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchEvent, MatchState, Preferences } from "@/lib/types";
import { hypeLine } from "@/lib/ai";

export function HypeEngine({ match, event, preferences }: { match: MatchState; event?: MatchEvent; preferences: Preferences }) {
  const [line, setLine] = useState(hypeLine(event, match, preferences));
  const requestId = useRef(0);
  const hypeEngineLastRef = useRef<number | null>(null);

  useEffect(() => {
    const id = ++requestId.current;
    setLine("");

    // prevent frequent requests: minimum gap between calls
    const minGap = 2500;
    const last = (hypeEngineLastRef.current || 0) as number;
    const since = Date.now() - last;
    if (since < minGap) {
      // skip network call and use local fallback
      setLine(hypeLine(event, match, preferences));
      return;
    }

    hypeEngineLastRef.current = Date.now();

    async function streamHype() {
      try {
        const response = await fetch("/api/hype", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match, event, preferences })
        });

        if (!response.body) throw new Error("No stream");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let next = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || id !== requestId.current) break;
          next += decoder.decode(value);
          setLine(next);
        }
      } catch {
        setLine(hypeLine(event, match, preferences));
      }
    }

    streamHype();
  }, [event?.id, preferences.tone]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Hype Engine</CardTitle>
        <Zap className="h-4 w-4 text-orange-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-orange-200/16 bg-orange-300/8 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-orange-100/76">
            <Clapperboard className="h-4 w-4" />
            Streaming reaction
          </div>
          <p className="min-h-20 text-lg font-black leading-7 text-white">{line || "Coach AI is reading the stadium..."}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm"><MessageCircle className="h-4 w-4" /> Meme</Button>
          <Button variant="secondary" size="sm"><RefreshCw className="h-4 w-4" /> Recap</Button>
          <Button variant="secondary" size="sm"><Bot className="h-4 w-4" /> Social</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReplayPopup({ event, onClose }: { event?: MatchEvent; onClose: () => void }) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-x-4 top-20 z-40 mx-auto max-w-lg rounded-lg border border-cyan-200/20 bg-slate-950/92 p-4 shadow-glow backdrop-blur-xl"
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.96 }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase text-cyan-100">Instant Replay Insight</div>
            <button className="text-sm text-white/54 hover:text-white" onClick={onClose}>Close</button>
          </div>
          <div className="text-xl font-black text-white">{event.title}</div>
          <p className="mt-2 text-sm leading-6 text-white/68">{event.detail} AI tags this as a {event.intensity}% intensity swing because it changed territory, crowd energy, and next-action pressure.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
