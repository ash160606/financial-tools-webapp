import { brand, tools } from "@/config/brand";
import { SpecimenControls } from "./SpecimenControls";

/**
 * Phase 1 specimen. This is scaffolding, not the product — Phase 6 replaces it
 * with the real landing page. It exists so the design tokens and type scale can
 * be reviewed before three calculators are built on top of them.
 */

const swatches = [
  { name: "paper", hex: "#FBFBF9", use: "ground" },
  { name: "ink", hex: "#0A0A0A", use: "type, axes, rules" },
  { name: "rule", hex: "#D8D6D0", use: "hairlines, gridlines" },
  { name: "principal", hex: "#E1E0DC", use: "money paid in" },
  { name: "ultramarine", hex: "#1F35FF", use: "TFSA + Universal Life" },
  { name: "amber", hex: "#FFB400", use: "Segregated Funds" },
  { name: "vermilion", hex: "#FF3B14", use: "Family & Legacy" },
];

export default function SpecimenPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        Phase 1 specimen — scaffold only
      </p>

      <h1 className="display mt-6 text-5xl leading-[0.95] md:text-7xl">
        Financial
        <br />
        Illustrations
      </h1>

      <p className="mt-6 max-w-xl text-lg text-muted">{brand.tagline}</p>

      <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em]">
        {brand.advisor} — {brand.firm}
      </p>

      {/* Palette */}
      <section className="mt-20">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Palette
        </h2>
        <div className="mt-6 border-t border-rule">
          {swatches.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-6 border-b border-rule py-4"
            >
              <span
                className="size-10 shrink-0 border border-rule"
                style={{ background: s.hex }}
              />
              <span className="display w-40 shrink-0 text-sm">{s.name}</span>
              <span className="tabular font-mono text-sm text-muted">
                {s.hex}
              </span>
              <span className="ml-auto text-right text-sm text-muted">
                {s.use}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Type */}
      <section className="mt-20">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Type
        </h2>
        <div className="mt-6 space-y-8 border-t border-rule pt-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
              Display — Archivo, width 125
            </p>
            <p className="display tabular mt-2 text-6xl">$1,284,905</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
              Body — Instrument Sans
            </p>
            <p className="mt-2 max-w-xl text-lg">
              Reinvesting the Canada Child Benefit until the child turns 18
              converts a transfer payment into a compounding position.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
              Ledger — IBM Plex Mono, tabular
            </p>
            <table className="tabular mt-2 font-mono text-sm">
              <tbody>
                {[
                  ["2026", "6,000", "218"],
                  ["2031", "36,000", "8,441"],
                  ["2044", "120,000", "141,586"],
                ].map(([year, paid, growth]) => (
                  <tr key={year} className="border-b border-rule">
                    <td className="py-2 pr-10">{year}</td>
                    <td className="py-2 pr-10 text-right">{paid}</td>
                    <td className="py-2 text-right">{growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Primitives, live */}
      <section className="mt-20">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Primitives
        </h2>
        <div className="mt-6">
          <SpecimenControls />
        </div>
      </section>

      {/* Accent binding — proves --accent is late-bound per tool */}
      <section className="mt-20">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Accent binding
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tools.map((t) => (
            <div
              key={t.slug}
              data-accent={t.accent}
              className="border border-rule p-5"
            >
              <div className="h-2 w-full bg-accent" />
              <p className="display mt-4 text-lg">{t.name}</p>
              <p className="mt-2 text-sm text-muted">{t.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
