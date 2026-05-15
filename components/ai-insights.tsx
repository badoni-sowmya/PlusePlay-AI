"use client";

import { Brain, Gauge, MessageSquareText, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MatchState, Preferences } from "@/lib/types";
import { localInsights } from "@/lib/ai";

const icons = [Brain, Gauge, WandSparkles, Sparkles, MessageSquareText];

export function AiInsights({ match, preferences, loading = false }: { match: MatchState; preferences: Preferences; loading?: boolean }) {
  const [insights, setInsights] = useState(localInsights(match, preferences));
  const [fetching, setFetching] = useState(false);

  const lastFetchRef = useRef(0);
  const pendingTimer = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const minGap = 2500; // minimum ms between requests
    const now = Date.now();
    const since = now - lastFetchRef.current;

    const doFetch = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      lastFetchRef.current = Date.now();
      setFetching(true);
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match, preferences }),
          signal: controller.signal
        });
        const data = await response.json();
        setInsights(data);
      } catch {
        if (!(controller.signal.aborted)) {
          setInsights(localInsights(match, preferences));
        }
      } finally {
        fetchingRef.current = false;
        setFetching(false);
      }
    };

    if (since >= minGap) {
      doFetch();
    } else {
      // schedule a single fetch after remaining time
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => doFetch(), minGap - since) as unknown as number;
    }

    return () => {
      if (pendingTimer.current) {
        window.clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
      controllerRef.current?.abort();
    };
  }, [match.clock, match.events[0]?.id, preferences.tone]);

  const cards = [
    ["Tactical Insight", insights.tacticalInsight],
    ["Momentum Shift", insights.momentumShift],
    ["Player Summary", insights.playerSummary],
    ["Changed The Game", insights.changedGame],
    ["Predicted Next Event", insights.predictedNextEvent]
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach AI Match Insights</CardTitle>
        <div className={`rounded-full px-2 py-1 text-xs font-bold ${fetching ? "bg-orange-300/14 text-orange-100" : "bg-cyan-300/14 text-cyan-100"}`}>{fetching ? "analyzing" : "adaptive"}</div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([title, body], index) => {
          const Icon = icons[index];
          return (
            <div key={title} className="rounded-lg border border-white/10 bg-black/24 p-3">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cyan-100">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xs font-bold uppercase text-white/44">{title}</div>
              {loading || fetching ? <Skeleton className="mt-2 h-11" /> : <p className="mt-2 text-sm leading-5 text-white/76">{body}</p>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
