"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { ModeTabs } from "@/components/ui/ModeTabs";
import { Select } from "@/components/ui/Select";
import { Choice } from "@/components/ui/Choice";
import { Stat } from "@/components/ui/Stat";
import { SplitBar } from "@/components/ui/SplitBar";
import { Callout } from "@/components/ui/Callout";
import { futureValueAnnuityDue } from "@/lib/finance";
import { formatCurrency, formatRate } from "@/lib/format";
import type { Accent } from "@/config/brand";

const MODES = [
  { value: "projection", label: "Projection" },
  { value: "reverse", label: "Reverse Target" },
  { value: "ccb", label: "CCB Shelter" },
] as const;

const ACCENTS: { value: Accent; label: string }[] = [
  { value: "ultramarine", label: "Ultramarine" },
  { value: "amber", label: "Amber" },
  { value: "vermilion", label: "Vermilion" },
];

/** Phase 3 specimen: the primitives, live, so they can be judged by hand. */
export function SpecimenControls() {
  const [accent, setAccent] = useState<Accent>("ultramarine");
  const [mode, setMode] = useState<string>("projection");
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(0.07);
  const [guarantee, setGuarantee] = useState<75 | 100>(75);

  const months = years * 12;
  const principal = monthly * months;
  const value = futureValueAnnuityDue(monthly, rate, months);
  const growth = value - principal;

  return (
    <div data-accent={accent} className="border border-ink p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Primitives — drag them
        </p>
        <Select
          label="Accent"
          value={accent}
          options={ACCENTS}
          onChange={(v) => setAccent(v as Accent)}
        />
      </div>

      <ModeTabs modes={MODES} value={mode} onChange={setMode} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Slider
            label="Monthly deposit"
            display={formatCurrency(monthly)}
            value={monthly}
            min={0}
            max={3000}
            step={50}
            onChange={setMonthly}
          />
          <Slider
            label="Investment duration"
            display={`${years} years`}
            value={years}
            min={1}
            max={40}
            onChange={setYears}
          />
          <Slider
            label="Annual growth rate"
            display={formatRate(rate)}
            value={rate * 100}
            min={2}
            max={15}
            step={0.5}
            onChange={(v) => setRate(v / 100)}
          />
          <Choice
            label="Insurance guarantee level"
            value={guarantee}
            options={[
              { value: 75, label: "75% guarantee", hint: "Maturity and death" },
              { value: 100, label: "100% guarantee", hint: "Premium protection" },
            ]}
            onChange={setGuarantee}
          />
        </div>

        <div className="flex flex-col gap-8">
          <Stat
            hero
            label="Projected value"
            value={formatCurrency(value)}
            sub={`After ${years} years at ${formatRate(rate)}`}
          />
          <div className="grid grid-cols-2 gap-6">
            <Stat marked label="You paid in" value={formatCurrency(principal)} />
            <Stat marked label="Growth" value={formatCurrency(growth)} />
          </div>
          <SplitBar
            title="Composition"
            segments={[
              {
                label: "Principal",
                value: principal,
                color: "var(--color-principal)",
              },
              { label: "Growth", value: growth, color: "var(--color-accent)" },
            ]}
          />
          <Callout title="Strategic advantage">
            Every dollar you deposit at the start of a month earns that month&apos;s
            growth. Over {years} years that timing alone accounts for{" "}
            <strong>
              {formatCurrency(value - futureValueAnnuityDue(monthly, rate, months) / (1 + rate / 12))}
            </strong>{" "}
            of the total.
          </Callout>
        </div>
      </div>
    </div>
  );
}
