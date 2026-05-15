import { useEffect, useRef } from "react";
import type { MatchState } from "@/lib/types";

type MatchUpdateCallback = (match: MatchState) => void;

export function useMatchSync(matchId: string, onMatchUpdate: MatchUpdateCallback, enabled = true) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const cbRef = useRef<MatchUpdateCallback>(onMatchUpdate);

  // keep a stable ref to the callback so effect doesn't restart each render
  useEffect(() => {
    cbRef.current = onMatchUpdate;
  }, [onMatchUpdate]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    let mounted = true;
    const tickMs = 2600;
    let interval = 0 as unknown as number;

    const fetchOnce = async () => {
      try {
        if (document.visibilityState !== "visible") return; // avoid polling while backgrounded
        const res = await fetch(`/api/match/state`);
        if (!mounted) return;
        if (!res.ok) return;
        const payload = await res.json();
        if (payload?.match) cbRef.current(payload.match as MatchState);
      } catch (err) {
        // swallow network errors for demo
      }
    };

    // initial fetch and schedule
    fetchOnce();
    interval = window.setInterval(fetchOnce, tickMs);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      unsubscribeRef.current?.();
    };
  }, [matchId, enabled]);
}

export function usePollSubmit() {
  const submitPollVote = async (pollId: string, optionIndex: number) => {
    try {
      const response = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionIndex })
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to submit poll vote:", error);
      return false;
    }
  };

  return { submitPollVote };
}

export function usePredictionSubmit() {
  const submitPrediction = async (matchId: string, category: string, prediction: string) => {
    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, category, prediction })
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to submit prediction:", error);
      return false;
    }
  };

  return { submitPrediction };
}
