import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

export type Segment = {
  label: string;
  value: number;
  /** Any CSS colour. Pass var(--color-accent) to follow the tool's hue. */
  color: string;
};

type SplitBarProps = {
  title: string;
  segments: Segment[];
  className?: string;
};

/**
 * Flat proportional bar. Replaces the six hand-rolled percentage bars in the
 * source files, which each recomputed their own widths inline and divided by
 * zero when every input was set to zero.
 */
export function SplitBar({ title, segments, className }: SplitBarProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const shares = segments.map((s) =>
    total > 0 ? (Math.max(0, s.value) / total) * 100 : 0,
  );

  const summary = segments
    .map((s, i) => `${formatPercent(shares[i])} ${s.label}`)
    .join(", ");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
          {title}
        </p>
      </div>

      <div
        className="flex h-6 w-full border border-ink bg-paper"
        role="img"
        aria-label={total > 0 ? `${title}: ${summary}` : `${title}: no allocation`}
      >
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="h-full transition-[width] duration-300 ease-out"
            style={{ width: `${shares[i]}%`, background: s.color }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-3 shrink-0 border border-ink"
              style={{ background: s.color }}
            />
            <span>{s.label}</span>
            <span className="tabular font-mono text-muted">
              {formatPercent(shares[i])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
