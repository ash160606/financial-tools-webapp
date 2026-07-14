/** Display formatting. Kept out of finance.ts, which never rounds. */

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

/** $1,284,905 — the form used throughout the source files. */
export function formatCurrency(value: number): string {
  return cad.format(Math.round(value));
}

/** $1.28M — for axis ticks, where the full figure will not fit. */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${Math.round(value)}`;
}

/** 7.5% */
export function formatRate(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}

export function formatPercent(share: number): string {
  return `${Math.round(share)}%`;
}

/** "1 year", "20 years". Every duration on the site goes through this. */
export function formatYears(n: number): string {
  return `${n} ${n === 1 ? "year" : "years"}`;
}
