"use client";

import { Activity, Radio, Shield, Sparkles, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heatmap, Meter, WinProbabilityGraph } from "@/components/charts";
import { LiveIndicator } from "@/components/live-indicator";
import type { MatchState } from "@/lib/types";
import { formatMinute } from "@/lib/utils";

export function LiveDashboard({ match, flash }: { match: MatchState; flash: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_.9fr]">
      <motion.section
        animate={flash ? { scale: [1, 1.015, 1], boxShadow: ["0 0 0 rgba(244,63,94,0)", "0 0 70px rgba(244,63,94,.24)", "0 0 0 rgba(244,63,94,0)"] } : {}}
        className="glass relative overflow-hidden rounded-lg p-4 sm:p-5"
      >
        <div className="absolute inset-0 bg-radar-sweep opacity-30" />
        <div className="absolute inset-0 bg-field-grid field-lines opacity-25" />
        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <LiveIndicator />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/24 px-3 py-1 text-xs text-white/70">
              <Timer className="h-4 w-4 text-cyan-200" />
              {formatMinute(match.clock)}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamScore name={match.home.name} shortName={match.home.shortName} score={match.home.score} color={match.home.color} align="left" />
            <div className="rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-center">
              <div className="text-xs text-white/46">Matchday 24</div>
              <div className="text-sm font-bold text-white">Pulse Arena</div>
            </div>
            <TeamScore name={match.away.name} shortName={match.away.shortName} score={match.away.score} color={match.away.color} align="right" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Meter label="Home possession" value={match.home.possession} tone="cyan" />
            <Meter label="Momentum" value={match.momentum} tone="orange" />
            <Meter label="Crowd excitement" value={match.crowd} tone="rose" />
          </div>
        </div>
      </motion.section>

      <Card>
        <CardHeader>
          <CardTitle>Team Pulse</CardTitle>
          <Activity className="h-4 w-4 text-emerald-200" />
        </CardHeader>
        <CardContent className="grid gap-3">
          <StatRow label="Shots" home={match.home.shots} away={match.away.shots} />
          <StatRow label="On target" home={match.home.shotsOnTarget} away={match.away.shotsOnTarget} />
          <StatRow label="Passes" home={match.home.passes} away={match.away.passes} />
          <StatRow label="xG" home={match.home.xg} away={match.away.xg} />
          <StatRow label="Fouls" home={match.home.fouls} away={match.away.fouls} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <Radio className="h-4 w-4 text-rose-200" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {match.events.slice(0, 5).map((event) => (
              <motion.div layout key={event.id} className="flex gap-3 rounded-lg border border-white/9 bg-white/[0.045] p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: match[event.team].color }} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white/50">{event.minute}&apos; · {event.type.toUpperCase()}</div>
                  <div className="text-sm font-semibold text-white">{event.title}</div>
                  <div className="text-xs leading-5 text-white/58">{event.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Win Probability</CardTitle>
            <Sparkles className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <WinProbabilityGraph data={match.winProbabilityHistory} />
            <div className="mt-2 flex justify-between text-xs text-white/58">
              <span>{match.home.shortName} {match.home.winProbability}%</span>
              <span>Draw {Math.max(4, 100 - match.home.winProbability - match.away.winProbability)}%</span>
              <span>{match.away.shortName} {match.away.winProbability}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Heatmap</CardTitle>
            <Shield className="h-4 w-4 text-cyan-200" />
          </CardHeader>
          <CardContent>
            <Heatmap values={match.heatmap} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeamScore({ name, shortName, score, color, align }: { name: string; shortName: string; score: number; color: string; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-xs font-bold uppercase text-white/48">{shortName}</div>
      <div className="truncate text-lg font-black text-white sm:text-2xl">{name}</div>
      <div className="mt-2 text-6xl font-black leading-none sm:text-7xl" style={{ color }}>{score}</div>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  return (
    <div className="grid grid-cols-[42px_1fr_42px] items-center gap-3 text-sm">
      <span className="font-semibold text-cyan-100">{home}</span>
      <div>
        <div className="mb-1 flex justify-between text-xs text-white/45">
          <span>{label}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-300" style={{ width: `${(Number(home) / Math.max(Number(home) + Number(away), 1)) * 100}%` }} />
        </div>
      </div>
      <span className="text-right font-semibold text-orange-100">{away}</span>
    </div>
  );
}
