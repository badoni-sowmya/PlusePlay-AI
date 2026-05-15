"use client";

import { BarChart3, Bot, Flame, Play, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StickyActionBar({ running, onDemo }: { running: boolean; onDemo: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/12 bg-slate-950/82 px-3 py-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-2">
        <Button variant="ghost" size="icon" aria-label="Live"><Radio className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" aria-label="Stats"><BarChart3 className="h-4 w-4" /></Button>
        <Button variant="primary" size="icon" onClick={onDemo} aria-label="Demo simulation"><Play className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} /></Button>
        <Button variant="ghost" size="icon" aria-label="Hype"><Flame className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" aria-label="Coach AI"><Bot className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
