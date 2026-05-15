"use client";

import { motion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";

export function Meter({ value, label, tone = "cyan" }: { value: number; label: string; tone?: "cyan" | "orange" | "rose" | "green" }) {
  const color = {
    cyan: "from-cyan-300 to-emerald-300",
    orange: "from-orange-300 to-rose-300",
    rose: "from-rose-400 to-fuchsia-300",
    green: "from-emerald-300 to-lime-300"
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-white/58">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
          initial={false}
          animate={{ width: `${clamp(value)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
    </div>
  );
}

export function WinProbabilityGraph({ data }: { data: Array<{ minute: number; home: number; away: number }> }) {
  const width = 320;
  const height = 110;
  const points = data.map((item, index) => {
    const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * width;
    const y = height - (item.home / 100) * height;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full overflow-visible">
      <defs>
        <linearGradient id="winLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#ff8b3d" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((line) => (
        <line key={line} x1="0" x2={width} y1={height - (line / 100) * height} y2={height - (line / 100) * height} stroke="rgba(255,255,255,.09)" />
      ))}
      <motion.polyline
        points={points.join(" ")}
        fill="none"
        stroke="url(#winLine)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7 }}
      />
      {data.slice(-1).map((item, index) => (
        <circle key={index} cx={width} cy={height - (item.home / 100) * height} r="5" fill="#22d3ee" />
      ))}
    </svg>
  );
}

export function Heatmap({ values }: { values: number[][] }) {
  return (
    <div className="relative aspect-[7/4] overflow-hidden rounded-lg border border-white/10 bg-emerald-950/50">
      <div className="absolute inset-0 bg-field-grid field-lines opacity-45" />
      <div className="absolute inset-3 rounded-[50%] border border-white/20" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-white/15" />
      <div className="relative grid h-full grid-cols-7 grid-rows-4 gap-1 p-2">
        {values.flatMap((row, y) =>
          row.map((value, x) => (
            <motion.div
              key={`${x}-${y}`}
              className="rounded-md"
              initial={false}
              animate={{
                backgroundColor: `rgba(${Math.round(34 + value * 220)}, ${Math.round(120 + value * 90)}, ${Math.round(120 - value * 60)}, ${0.18 + value * 0.66})`,
                boxShadow: value > 0.72 ? "0 0 22px rgba(255,139,61,.35)" : "0 0 0 rgba(0,0,0,0)"
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
