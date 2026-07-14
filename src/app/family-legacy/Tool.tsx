"use client";

import {
  useQueryStates,
  parseAsInteger,
  parseAsFloat,
  parseAsStringLiteral,
  parseAsArrayOf,
} from "nuqs";
import { Slider } from "@/components/ui/Slider";
import { ModeTabs } from "@/components/ui/ModeTabs";
import { Select } from "@/components/ui/Select";
import { Stat } from "@/components/ui/Stat";
import { SplitBar } from "@/components/ui/SplitBar";
import { Callout } from "@/components/ui/Callout";
import { ProjectionCurve } from "@/components/chart/ProjectionCurve";
import { Ledger } from "@/components/chart/Ledger";
import {
  projectSeries,
  solveMonthlyForTarget,
  ccbStream,
  streamValueAt,
  type Stream,
} from "@/lib/finance";
import {
  formatCurrency,
  formatRate,
  formatPercent,
  formatYears,
} from "@/lib/format";

const MODES = [
  { value: "accumulation", label: "Accumulation" },
  { value: "reverse", label: "Reverse Target" },
] as const;

type Mode = (typeof MODES)[number]["value"];

const KID_COUNTS = [
  { value: "0", label: "None" },
  { value: "1", label: "1 child" },
  { value: "2", label: "2 children" },
  { value: "3", label: "3 children" },
  { value: "4", label: "4 children" },
];

const AGES = Array.from({ length: 18 }, (_, i) => ({
  value: String(i),
  label: `${i} yrs`,
}));

const BENEFITS = [0, 150, 300, 450, 550, 650, 750].map((v) => ({
  value: String(v),
  label: `$${v}`,
}));

/** The grant matches $500 a year, and stops after 15 years of eligibility. */
function cesgPotential(childAge: number): number {
  return Math.min(Math.max(0, 18 - childAge), 15) * 500;
}

export function FamilyLegacyTool() {
  const [s, set] = useQueryStates({
    mode: parseAsStringLiteral(MODES.map((m) => m.value)).withDefault("accumulation"),
    husband: parseAsInteger.withDefault(500),
    wife: parseAsInteger.withDefault(500),
    years: parseAsInteger.withDefault(20),
    rate: parseAsFloat.withDefault(7.5),
    target: parseAsInteger.withDefault(1_000_000),
    kids: parseAsInteger.withDefault(2),
    ages: parseAsArrayOf(parseAsInteger).withDefault([4, 6, 8, 10]),
    benefits: parseAsArrayOf(parseAsInteger).withDefault([450, 450, 450, 450]),
  });

  const mode = s.mode as Mode;
  const rate = s.rate / 100;
  const months = s.years * 12;

  const children = Array.from({ length: s.kids }, (_, i) => ({
    index: i,
    age: s.ages[i] ?? 4,
    benefit: s.benefits[i] ?? 450,
  }));

  // Each child's benefit is its own stream, paying until that child turns 18 and
  // then compounding on whatever it has already banked.
  const benefitStreams: Stream[] = children.map((c) =>
    ccbStream(c.age, c.benefit, rate),
  );
  const benefitValue = benefitStreams.reduce(
    (sum, st) => sum + streamValueAt(st, months),
    0,
  );
  const benefitMonthly = children.reduce((sum, c) => sum + c.benefit, 0);

  function setChild(i: number, key: "ages" | "benefits", value: number) {
    const next = [...s[key]];
    while (next.length < 4) next.push(key === "ages" ? 4 : 450);
    next[i] = value;
    set({ [key]: next });
  }

  let spouseStreams: Stream[];
  let hero = { label: "", value: "", sub: "" };
  let cards: { label: string; value: string; sub?: string }[] = [];
  let callout: React.ReactNode;

  if (mode === "accumulation") {
    spouseStreams = [
      { monthly: s.husband, annualRate: rate },
      { monthly: s.wife, annualRate: rate },
    ];

    const husbandValue = streamValueAt(spouseStreams[0], months);
    const wifeValue = streamValueAt(spouseStreams[1], months);
    const total = husbandValue + wifeValue + benefitValue;
    const benefitPaidIn = benefitStreams.reduce(
      (sum, st) => sum + st.monthly * Math.min(months, st.contributionMonths ?? months),
      0,
    );

    hero = {
      label: "Combined family position",
      value: formatCurrency(total),
      sub: `After ${formatYears(s.years)} at ${formatRate(rate)}`,
    };
    cards = [
      { label: "Husband", value: formatCurrency(husbandValue) },
      { label: "Wife", value: formatCurrency(wifeValue) },
      {
        label: "Child benefit",
        value: formatCurrency(benefitValue),
        sub: benefitMonthly > 0 ? `${formatCurrency(benefitMonthly)}/mo reinvested` : "None",
      },
    ];
    callout =
      benefitPaidIn > 0 ? (
        <>
          The government hands you{" "}
          <strong>{formatCurrency(benefitPaidIn)}</strong> in child benefit across
          this period. Reinvested rather than spent, it grows into{" "}
          <strong>{formatCurrency(benefitValue)}</strong>, which is{" "}
          <strong>{formatPercent((benefitValue / total) * 100)}</strong> of the
          family&apos;s whole position. You never earned that money and you never
          contributed it.
        </>
      ) : (
        <>
          With no benefit reinvested, the entire{" "}
          <strong>{formatCurrency(total)}</strong> comes out of the two of you.
          Add a child on the left to see what the benefit would carry.
        </>
      );
  } else {
    // The benefit is already committed and costs the family nothing, so it should
    // reduce the bill before anybody is asked to fund the rest.
    const gap = Math.max(0, s.target - benefitValue);
    const combinedMonthly = solveMonthlyForTarget(gap, rate, months);
    const each = combinedMonthly / 2;

    spouseStreams = [
      { monthly: each, annualRate: rate },
      { monthly: each, annualRate: rate },
    ];

    const fundedShare = s.target > 0 ? Math.min(100, (benefitValue / s.target) * 100) : 0;

    hero = {
      label: "Required monthly deposit",
      value: `${formatCurrency(combinedMonthly)}/mo`,
      sub: `Between you both, to reach ${formatCurrency(s.target)} in ${formatYears(s.years)}`,
    };
    cards = [
      { label: "Husband", value: `${formatCurrency(each)}/mo` },
      { label: "Wife", value: `${formatCurrency(each)}/mo` },
      {
        label: "Covered by child benefit",
        value: formatCurrency(benefitValue),
        sub: `${formatPercent(fundedShare)} of the target`,
      },
    ];
    callout = (
      <>
        The child benefit will be worth{" "}
        <strong>{formatCurrency(benefitValue)}</strong> by the end of the period,
        which covers <strong>{formatPercent(fundedShare)}</strong> of your target
        on its own. We subtract that first, then split what remains between you.
        Without reinvesting the benefit you would each need{" "}
        <strong>
          {formatCurrency(solveMonthlyForTarget(s.target, rate, months) / 2)}
        </strong>{" "}
        a month instead of {formatCurrency(each)}.
      </>
    );
  }

  const series = projectSeries([...spouseStreams, ...benefitStreams], months);

  return (
    <div className="flex flex-col gap-10">
      <ModeTabs
        modes={MODES}
        value={mode}
        onChange={(v) => set({ mode: v as Mode })}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="flex flex-col gap-7">
          {mode === "accumulation" ? (
            <>
              <Slider
                label="Husband, monthly"
                display={formatCurrency(s.husband)}
                value={s.husband}
                min={0}
                max={3000}
                step={50}
                onChange={(v) => set({ husband: v })}
              />
              <Slider
                label="Wife, monthly"
                display={formatCurrency(s.wife)}
                value={s.wife}
                min={0}
                max={3000}
                step={50}
                onChange={(v) => set({ wife: v })}
              />
            </>
          ) : (
            <Slider
              label="Target"
              display={formatCurrency(s.target)}
              value={s.target}
              min={100_000}
              max={5_000_000}
              step={50_000}
              onChange={(v) => set({ target: v })}
            />
          )}

          <div className="flex flex-col gap-4 border-t border-rule pt-6">
            <Select
              label="Children"
              value={String(s.kids)}
              options={KID_COUNTS}
              onChange={(v) => set({ kids: Number(v) })}
            />

            {children.map((c) => (
              <div
                key={c.index}
                className="flex flex-col gap-3 border border-rule p-3"
              >
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Child {c.index + 1}
                </p>
                <Select
                  label="Age"
                  value={String(c.age)}
                  options={AGES}
                  onChange={(v) => setChild(c.index, "ages", Number(v))}
                />
                <Select
                  label="Monthly benefit"
                  value={String(c.benefit)}
                  options={BENEFITS}
                  onChange={(v) => setChild(c.index, "benefits", Number(v))}
                />
              </div>
            ))}
          </div>

          <Slider
            label="Investment duration"
            display={formatYears(s.years)}
            value={s.years}
            min={1}
            max={40}
            onChange={(v) => set({ years: v })}
          />
          <Slider
            label="Annual growth rate"
            display={formatRate(rate)}
            value={s.rate}
            min={2}
            max={15}
            step={0.5}
            onChange={(v) => set({ rate: v })}
          />
        </div>

        <div className="flex flex-col gap-8">
          <Stat hero label={hero.label} value={hero.value} sub={hero.sub} />
          <div className="grid gap-6 sm:grid-cols-3">
            {cards.map((c) => (
              <Stat key={c.label} marked label={c.label} value={c.value} sub={c.sub} />
            ))}
          </div>
          <SplitBar
            title="Where the money comes from"
            segments={[
              {
                label: "The two of you",
                value: spouseStreams.reduce(
                  (sum, st) => sum + streamValueAt(st, months),
                  0,
                ),
                color: "var(--color-principal)",
              },
              {
                label: "Child benefit",
                value: benefitValue,
                color: "var(--color-accent)",
              },
            ]}
          />
        </div>
      </div>

      <div>
        <ProjectionCurve series={series} />
        <div className="mt-6">
          <Ledger series={series} />
        </div>
      </div>

      <Callout title="What this means">{callout}</Callout>

      {children.length > 0 ? (
        <div className="grid gap-px border border-ink bg-ink md:grid-cols-2">
          {children.map((c) => {
            const runway = 18 - c.age;
            return (
              <div key={c.index} className="bg-paper p-5">
                <h3 className="display text-base">
                  Child {c.index + 1}, age {c.age}
                </h3>
                {runway > 0 ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    You have <strong className="text-ink">{formatYears(runway)}</strong>{" "}
                    before they turn 18. Paying into an RESP over that window
                    collects up to{" "}
                    <strong className="text-ink">
                      {formatCurrency(cesgPotential(c.age))}
                    </strong>{" "}
                    in government matching grants, which is money you cannot get
                    any other way.
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    The benefit and the grants have both stopped. Move what has
                    accumulated into a tax-exempt shelter and name them as the
                    beneficiary.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
