"use client";

import { useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { area, line, curveMonotoneX } from "d3-shape";
import type { SeriesPoint } from "@/lib/finance";
import { formatCurrency, formatCompact } from "@/lib/format";
import { useTweenedArray } from "@/lib/useTweenedArray";
import { cn } from "@/lib/cn";

/** Fixed sample count, so the tween always has two arrays of equal length. */
const SAMPLES = 120;

const W = 960;
const H = 420;
const M = { top: 24, right: 24, bottom: 36, left: 60 };

export type Floor = {
  value: number;
  label: string;
};

type ProjectionCurveProps = {
  series: SeriesPoint[];
  /** Draws a hard horizontal rule across the plot. The segregated-fund contract. */
  floor?: Floor;
  /** Names the coloured band. "Growth" everywhere so far. */
  growthLabel?: string;
  principalLabel?: string;
  className?: string;
};

function resample(series: SeriesPoint[], key: "principal" | "value"): number[] {
  if (series.length === 0) return new Array(SAMPLES).fill(0);
  const out: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const at = (i / (SAMPLES - 1)) * (series.length - 1);
    const lo = Math.floor(at);
    const hi = Math.min(series.length - 1, lo + 1);
    const f = at - lo;
    out.push(series[lo][key] * (1 - f) + series[hi][key] * f);
  }
  return out;
}

/**
 * The hero. A stacked area: what you paid in, and the growth stacked on top of
 * it. The two bands never swap meaning, in any tool.
 *
 * This is the chart the source files never had. They computed only a start and
 * an end value, which is why each one visualised its result as a percentage bar.
 */
export function ProjectionCurve({
  series,
  floor,
  growthLabel = "Growth",
  principalLabel = "You paid in",
  className,
}: ProjectionCurveProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const totalMonths = series.length > 0 ? series[series.length - 1].month : 0;
  const years = totalMonths / 12;

  const targetPrincipal = useMemo(() => resample(series, "principal"), [series]);
  const targetValue = useMemo(() => resample(series, "value"), [series]);

  const principal = useTweenedArray(targetPrincipal);
  const value = useTweenedArray(targetValue);

  const maxY = Math.max(
    1,
    value[value.length - 1] ?? 0,
    floor?.value ?? 0,
  );

  const x = scaleLinear().domain([0, SAMPLES - 1]).range([M.left, W - M.right]);
  const y = scaleLinear().domain([0, maxY]).nice().range([H - M.bottom, M.top]);

  const idx = (i: number) => i;

  const principalArea = area<number>()
    .x((_, i) => x(idx(i)))
    .y0(y(0))
    .y1((d) => y(d))
    .curve(curveMonotoneX);

  const growthArea = area<number>()
    .x((_, i) => x(idx(i)))
    .y0((_, i) => y(principal[i] ?? 0))
    .y1((d) => y(d))
    .curve(curveMonotoneX);

  const valueLine = line<number>()
    .x((_, i) => x(idx(i)))
    .y((d) => y(d))
    .curve(curveMonotoneX);

  const principalLine = line<number>()
    .x((_, i) => x(idx(i)))
    .y((d) => y(d))
    .curve(curveMonotoneX);

  const yTicks = y.ticks(4);

  // Year ticks along the bottom, at most six of them.
  const yearStep = Math.max(1, Math.ceil(years / 6));
  const yearTicks: number[] = [];
  for (let yr = 0; yr <= years; yr += yearStep) yearTicks.push(yr);

  const hovered = hoverIndex === null ? null : {
    x: x(hoverIndex),
    principal: principal[hoverIndex] ?? 0,
    value: value[hoverIndex] ?? 0,
    year: (hoverIndex / (SAMPLES - 1)) * years,
  };

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(x.invert(Math.max(M.left, Math.min(W - M.right, px))));
    setHoverIndex(Math.max(0, Math.min(SAMPLES - 1, i)));
  }

  return (
    <figure className={cn("m-0", className)}>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Projection over ${Math.round(years)} years. You pay in ${formatCurrency(
            targetPrincipal[SAMPLES - 1] ?? 0,
          )} and the position reaches ${formatCurrency(targetValue[SAMPLES - 1] ?? 0)}.`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* Gridlines stay recessive: hairline, no fill, behind everything. */}
          {yTicks.map((t) => (
            <line
              key={t}
              x1={M.left}
              x2={W - M.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-rule)"
              strokeWidth={1}
            />
          ))}

          <path d={growthArea(value) ?? ""} fill="var(--color-accent)" />
          <path d={principalArea(principal) ?? ""} fill="var(--color-principal)" />

          {/* 2px paper gap where the two fills meet, so the boundary reads. */}
          <path
            d={principalLine(principal) ?? ""}
            fill="none"
            stroke="var(--color-paper)"
            strokeWidth={2}
          />

          {/* Hard ink edge on the top of the stack. */}
          <path
            d={valueLine(value) ?? ""}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={2}
          />

          {/* The contract term, drawn as a fact rather than as a data series:
              solid ink, straight across, labelled. */}
          {floor ? (
            <g>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y(floor.value)}
                y2={y(floor.value)}
                stroke="var(--color-ink)"
                strokeWidth={2}
                strokeDasharray="8 5"
              />
              <text
                x={M.left + 8}
                y={y(floor.value) - 8}
                className="fill-ink font-mono text-[13px] uppercase tracking-wider"
              >
                {floor.label} {formatCurrency(floor.value)}
              </text>
            </g>
          ) : null}

          {/* Axes */}
          <line
            x1={M.left}
            x2={W - M.right}
            y1={y(0)}
            y2={y(0)}
            stroke="var(--color-ink)"
            strokeWidth={1.5}
          />
          {yTicks.map((t) => (
            <text
              key={t}
              x={M.left - 10}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-[var(--color-muted)] font-mono text-[12px] tabular-nums"
            >
              {formatCompact(t)}
            </text>
          ))}
          {yearTicks.map((yr) => (
            <text
              key={yr}
              x={x((yr / Math.max(years, 1)) * (SAMPLES - 1))}
              y={H - M.bottom + 20}
              textAnchor="middle"
              className="fill-[var(--color-muted)] font-mono text-[12px] tabular-nums"
            >
              {yr === 0 ? "Now" : `Yr ${yr}`}
            </text>
          ))}

          {/* Crosshair */}
          {hovered ? (
            <g>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={M.top}
                y2={y(0)}
                stroke="var(--color-ink)"
                strokeWidth={1}
              />
              <circle
                cx={hovered.x}
                cy={y(hovered.value)}
                r={5}
                fill="var(--color-paper)"
                stroke="var(--color-ink)"
                strokeWidth={2}
              />
            </g>
          ) : null}
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute top-2 border border-ink bg-paper px-3 py-2 shadow-[3px_3px_0_0_var(--color-ink)]"
            style={{
              left: `${(hovered.x / W) * 100}%`,
              transform:
                hovered.x > W / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Year {Math.round(hovered.year)}
            </p>
            <p className="display tabular mt-1 text-xl">
              {formatCurrency(hovered.value)}
            </p>
            <p className="tabular mt-1 font-mono text-xs text-muted">
              {formatCurrency(hovered.principal)} paid in
            </p>
          </div>
        ) : null}
      </div>

      {/* Two series, so a legend is always present. Identity is never colour alone:
          each swatch carries its name. */}
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-3 border border-ink bg-principal"
          />
          {principalLabel}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3 border border-ink bg-accent" />
          {growthLabel}
        </span>
        {floor ? (
          <span className="flex items-center gap-2 text-muted">
            <span aria-hidden className="h-0 w-4 border-t-2 border-dashed border-ink" />
            {floor.label}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
