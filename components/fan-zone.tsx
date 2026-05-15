"use client";

import { Laugh, Mic, Send, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/charts";
import type { MatchState } from "@/lib/types";
import { usePollSubmit, usePredictionSubmit } from "@/lib/useSyncHooks";

export function FanZone({ match, onReaction }: { match: MatchState; onReaction: (emoji: string) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const totalVotes = match.poll.options.reduce((sum, option) => sum + option.votes, 0);

  const { submitPollVote } = usePollSubmit();

  function submitVote() {
    if (selected !== null && !voted) {
      // Optimistic UI update
      setVoted(true);
      // Send to backend
      submitPollVote(match.poll.id, selected).then((ok) => {
        if (!ok) {
          // revert optimistic state on failure
          setVoted(false);
        }
      });
    }
  }

  const { submitPrediction: submitPredictionApi } = usePredictionSubmit();

  function submitPrediction(player: string) {
    setPrediction(player);
    submitPredictionApi(`${match.home.shortName}-${match.away.shortName}`, "next-scorer", player).then((ok) => {
      if (!ok) {
        // Optionally notify user of failure (kept silent for now)
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Live Fan Poll</CardTitle>
          <Users className="h-4 w-4 text-cyan-200" />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold text-white">{match.poll.question}</p>
          {match.poll.options.map((option, index) => {
            const pct = Math.round((option.votes / Math.max(totalVotes, 1)) * 100);
            return (
              <button
                key={option.label}
                onClick={() => !voted && setSelected(index)}
                disabled={voted}
                className={`w-full rounded-lg border border-white/10 bg-white/[0.045] p-3 text-left transition ${selected === index && !voted ? "border-cyan-300 bg-cyan-300/20" : ""} ${voted ? "opacity-60" : "hover:bg-white/10"}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-white">{option.label}</span>
                  <span className={selected === index && !voted ? "text-cyan-100 font-bold" : "text-white/50"}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-300" animate={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
          {!voted && selected !== null && (
            <Button onClick={submitVote} className="w-full" size="sm">Submit Vote</Button>
          )}
          {voted && <div className="rounded-lg bg-cyan-300/10 p-2 text-xs text-cyan-50">Vote submitted! Thanks for participating.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictions & Sentiment</CardTitle>
          <Trophy className="h-4 w-4 text-orange-200" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-black/24 p-3">
            <div className="text-xs font-bold uppercase text-white/44">Guess next scorer</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Maya Chen", "Tariq Okafor", "Leo Ramos", "No goal"].map((name) => (
                <Button
                  key={name}
                  variant={prediction === name ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => submitPrediction(name)}
                  className="min-w-0 text-xs"
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/24 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white/44">Break trivia</span>
              <Laugh className="h-4 w-4 text-rose-200" />
            </div>
            <p className="text-sm text-white/76">Which team has more progressive passes tonight?</p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm">{match.home.shortName}</Button>
              <Button variant="secondary" size="sm">{match.away.shortName}</Button>
            </div>
          </div>
          <Meter label="Fan sentiment" value={match.sentiment} tone="green" />
          <div className="flex items-center gap-2">
            {["🔥", "😱", "👏", "🧠"].map((emoji) => (
              <Button key={emoji} variant="secondary" size="icon" onClick={() => onReaction(emoji)} aria-label={`React ${emoji}`}>{emoji}</Button>
            ))}
            <Button variant="ghost" size="icon" aria-label="Voice assistant"><Mic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Send chat"><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
