import { cn } from "@/lib/cn";

type StatProps = {
  label: string;
  value: string;
  sub?: string;
  /** The one figure the page is actually about. */
  hero?: boolean;
  /** Draws a thick accent rule down the left edge. */
  marked?: boolean;
  className?: string;
};

export function Stat({
  label,
  value,
  sub,
  hero = false,
  marked = false,
  className,
}: StatProps) {
  return (
    <div
      className={cn(
        marked && "border-l-4 border-l-accent pl-4",
        hero && "py-2",
        className,
      )}
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </p>
      <p
        className={cn(
          "display tabular mt-1",
          hero ? "text-5xl md:text-7xl" : "text-2xl",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}
