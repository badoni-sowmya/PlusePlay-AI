export function LiveIndicator({ label = "LIVE" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/12 px-3 py-1 text-xs font-bold text-rose-100 shadow-live">
      <span className="h-2 w-2 rounded-full bg-rose-300 animate-pulseLive" />
      {label}
    </div>
  );
}
