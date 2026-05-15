"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-cyan-300/30 bg-cyan-300 text-slate-950 hover:bg-cyan-200 shadow-glow",
        variant === "secondary" && "border-white/15 bg-white/10 text-white hover:bg-white/16",
        variant === "ghost" && "border-transparent bg-transparent text-white/76 hover:bg-white/10 hover:text-white",
        variant === "danger" && "border-rose-300/25 bg-rose-500/18 text-rose-100 hover:bg-rose-500/26",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-4",
        size === "icon" && "h-10 w-10 p-0",
        className
      )}
      {...props}
    />
  );
}
