import type { SeriesPoint } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

/**
 * The chart's data, as a table.
 *
 * This is the printed policy illustration the whole site imitates, and it is
 * also how a screen-reader user, a colourblind user, or anyone who prints the
 * page reads the same numbers the curve draws.
 */
export function Ledger({ series }: { series: SeriesPoint[] }) {
  const rows = series.filter((p) => p.month > 0 && p.month % 12 === 0);

  return (
    <details className="group border-t border-rule pt-4">
      <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.15em] text-muted hover:text-ink">
        <span className="group-open:hidden">Show the year-by-year ledger</span>
        <span className="hidden group-open:inline">Hide the ledger</span>
      </summary>

      <div className="mt-4 max-h-80 overflow-auto">
        <table className="w-full min-w-lg border-collapse text-sm">
          <caption className="sr-only">
            Year by year projection: deposits paid in, growth earned, and total value.
          </caption>
          <thead className="sticky top-0 bg-paper">
            <tr className="border-b border-ink text-left">
              <th scope="col" className="py-2 pr-6 font-mono text-xs uppercase tracking-wider text-muted">
                Year
              </th>
              <th scope="col" className="py-2 pr-6 text-right font-mono text-xs uppercase tracking-wider text-muted">
                Paid in
              </th>
              <th scope="col" className="py-2 pr-6 text-right font-mono text-xs uppercase tracking-wider text-muted">
                Growth
              </th>
              <th scope="col" className="py-2 text-right font-mono text-xs uppercase tracking-wider text-muted">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="tabular font-mono">
            {rows.map((p) => (
              <tr key={p.month} className="border-b border-rule">
                <th scope="row" className="py-2 pr-6 text-left font-normal">
                  {p.month / 12}
                </th>
                <td className="py-2 pr-6 text-right">{formatCurrency(p.principal)}</td>
                <td className="py-2 pr-6 text-right">
                  {formatCurrency(p.value - p.principal)}
                </td>
                <td className="py-2 text-right font-semibold">
                  {formatCurrency(p.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
