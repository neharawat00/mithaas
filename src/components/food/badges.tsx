import { Flame, Leaf, Star, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
        isVeg ? "border-leaf" : "border-chilli",
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isVeg ? "bg-leaf" : "bg-chilli")} />
    </span>
  );
}

export function SpiceMeter({ level }: { level: number }) {
  if (level <= 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Spice level ${level} of 4`}>
      {Array.from({ length: Math.min(level, 4) }).map((_, i) => (
        <Flame key={i} className="h-3 w-3 text-chilli" aria-hidden />
      ))}
    </span>
  );
}

export function RatingPill({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-leaf/12 px-2 py-0.5 text-xs font-semibold text-leaf">
      <Star className="h-3 w-3 fill-current" aria-hidden />
      {rating.toFixed(1)}
      {count ? <span className="font-normal text-muted-foreground">({count})</span> : null}
    </span>
  );
}

export function PrepTime({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Timer className="h-3 w-3" aria-hidden />
      {minutes} min
    </span>
  );
}

export function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

export function LeafNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-leaf">
      <Leaf className="h-3 w-3" aria-hidden />
      {children}
    </span>
  );
}
