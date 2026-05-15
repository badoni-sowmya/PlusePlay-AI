"use client";

import { ArrowRight, Flame, Play, Sparkles, Trophy, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AiInsights } from "@/components/ai-insights";
import { CoachChat } from "@/components/coach-chat";
import { FanZone } from "@/components/fan-zone";
import { HypeEngine, ReplayPopup } from "@/components/hype-engine";
import { LiveDashboard } from "@/components/live-dashboard";
import { PreferencesPanel } from "@/components/preferences-panel";
import { StickyActionBar } from "@/components/sticky-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { initialMatch } from "@/lib/mock-data";
import { nextSimulationTick } from "@/lib/simulation";
import type { MatchEvent, Preferences } from "@/lib/types";
import { useMatchSync } from "@/lib/useSyncHooks";

export default function Home() {
  const [match, setMatch] = useState(initialMatch);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [lastEvent, setLastEvent] = useState<MatchEvent | undefined>(initialMatch.events[0]);
  const [flash, setFlash] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [preferences, setPreferencesState] = useState<Preferences>({
    favoriteTeam: "home",
    favoritePlayers: ["Maya Chen", "Leo Ramos"],
    tone: "analytical"
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("pulseplay-preferences");
      if (saved) {
        setPreferencesState(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load preferences from localStorage:", e);
    }
  }, []);

  // Persist preferences whenever they change
  const setPreferences = (prefs: Preferences) => {
    setPreferencesState(prefs);
    if (typeof window !== "undefined") {
      localStorage.setItem("pulseplay-preferences", JSON.stringify(prefs));
    }
  };

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setMatch((current) => {
        const result = nextSimulationTick(current, Date.now());
        if (result.majorEvent) {
          setLastEvent(result.majorEvent);
          setFlash(true);
          window.setTimeout(() => setFlash(false), 900);
        }
        return result.match;
      });
      setTick((value) => value + 1);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [running]);

  // Sync with server snapshot when not running the local simulation
  useMatchSync("demo", (serverMatch) => {
    if (!running) {
      setMatch(serverMatch);
    }
  }, !running);

  function handleReaction(emoji: string) {
    setReaction(emoji);
    window.setTimeout(() => setReaction(null), 900);
  }

  const heroEvent = useMemo(() => match.events[0], [match.events]);

  return (
    <main className="min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <Hero running={running} onDemo={() => setRunning((value) => !value)} />

      <section id="demo" className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <LiveDashboard match={match} flash={flash} />
          <AiInsights match={match} preferences={preferences} />
          <FanZone match={match} onReaction={handleReaction} />
        </div>
        <aside className="space-y-4">
          <PreferencesPanel match={match} preferences={preferences} setPreferences={setPreferences} />
          <HypeEngine match={match} event={heroEvent} preferences={preferences} />
          <CoachChat match={match} preferences={preferences} />
        </aside>
      </section>

      <FeatureShowcase />
      <ReplayPopup event={flash ? lastEvent : undefined} onClose={() => setFlash(false)} />
      <ReactionBurst reaction={reaction} />
      <StickyActionBar running={running} onDemo={() => setRunning((value) => !value)} />
    </main>
  );
}

function Hero({ running, onDemo }: { running: boolean; onDemo: () => void }) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden px-4 pt-6 sm:px-6">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-field-grid field-lines opacity-25" />
        <div className="absolute left-1/2 top-20 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-radar-sweep opacity-45 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030806] to-transparent" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10">
        <nav className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">PulsePlay AI</div>
              <div className="text-xs text-white/48">live sports second screen</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm">Features</Button>
            <Button variant="ghost" size="sm">Docs</Button>
            <Button size="sm" onClick={onDemo}><Play className="h-4 w-4" /> {running ? "Pause Demo" : "Demo Match"}</Button>
          </div>
        </nav>

        <div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div className="max-w-2xl py-8 sm:py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
              <Wifi className="h-4 w-4" />
              Realtime AI companion for live matches
            </div>
            <h1 className="text-5xl font-black leading-[1.02] text-white sm:text-7xl">PulsePlay AI</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
              A cinematic second-screen control room for scores, fan reactions, AI tactics, hype commentary, predictions, and simulated match moments.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={onDemo}><Play className="h-4 w-4" /> {running ? "Pause simulation" : "Start demo simulation"}</Button>
              <a href="#demo"><Button variant="secondary"><Sparkles className="h-4 w-4" /> Open live dashboard</Button></a>
            </div>
          </div>

          <motion.div className="relative min-h-[420px]" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="absolute inset-0 rounded-lg border border-white/10 bg-black/30 backdrop-blur-xl" />
            <div className="absolute inset-4 rounded-lg border border-cyan-200/18 bg-emerald-950/35">
              <div className="absolute inset-0 bg-field-grid opacity-30" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
              <motion.div className="absolute left-[18%] top-[25%] h-20 w-20 rounded-full border border-cyan-200/40 bg-cyan-300/16 shadow-glow" animate={{ x: [0, 120, 70, 180], y: [0, 40, 130, 80] }} transition={{ duration: 7, repeat: Infinity, repeatType: "mirror" }} />
              <motion.div className="absolute right-[18%] top-[48%] h-16 w-16 rounded-full border border-orange-200/40 bg-orange-300/18" animate={{ x: [0, -90, -40, -150], y: [0, -90, 20, -30] }} transition={{ duration: 6.5, repeat: Infinity, repeatType: "mirror" }} />
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                {["AI Heatmap", "Fan Pulse", "Win 58%"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-black/36 p-3 text-center text-xs font-bold text-white/78">{item}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const features = [
    ["Smart Event Detection", "Goals, fouls, substitutions, clutch swings, replay insights, and automatic live polls."],
    ["AI Hype Engine", "Streaming commentary, meme captions, social reactions, and post-match summaries."],
    ["Realtime Fan Layer", "Polls, emoji bursts, trivia, prediction games, and sentiment signals built for backend sync."]
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-cyan-100/70">Hackathon ready</div>
          <h2 className="mt-2 text-3xl font-black text-white">Built for the moment after the moment</h2>
        </div>
        <ArrowRight className="hidden h-6 w-6 text-white/40 sm:block" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <Trophy className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-white/64">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ReactionBurst({ reaction }: { reaction: string | null }) {
  return (
    <AnimatePresence>
      {reaction && (
        <motion.div
          key={reaction}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center text-7xl"
          initial={{ opacity: 0, scale: 0.6, y: 40 }}
          animate={{ opacity: 1, scale: 1.25, y: -30 }}
          exit={{ opacity: 0, scale: 0.9, y: -80 }}
        >
          {reaction}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
