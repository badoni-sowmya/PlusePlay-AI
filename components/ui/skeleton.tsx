import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-[linear-gradient(110deg,rgba(255,255,255,.06),rgba(255,255,255,.14),rgba(255,255,255,.06))] bg-[length:220%_100%] animate-shimmer",
        className
      )}
    />
  );
}
