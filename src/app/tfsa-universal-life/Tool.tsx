"use client";

import { useQueryStates, parseAsInteger, parseAsFloat, parseAsStringLiteral } from "nuqs";
import { Slider } from "@/components/ui/Slider";
import { ModeTabs } from "@/components/ui/ModeTabs";
import { Stat } from "@/components/ui/Stat";
import { SplitBar } from "@/components/ui/SplitBar";
import { Callout } from "@/components/ui/Callout";
import { ProjectionCurve } from "@/components/chart/ProjectionCurve";
import { Ledger } from "@/components/chart/Ledger";
import {
  projectSeries,
  solveMonthlyForTarget,
  compoundLumpSum,
  ulCostOfInsuranceDrag,
  ulEffectiveRate,
  clampTargetAge,
  JUVENILE_COI_DRAG,
  type Stream,
} from "@/lib/finance";
import { formatCurrency, formatRate, formatYears } from "@/lib/format";

const MODES = [
  { value: "projection", label: "Projection" },
  { value: "reverse", label: "Reverse Target" },
  { value: "ccb", label: "CCB Shelter" },
] as const;

type Mode = (typeof MODES)[number]["value"];

export function TfsaUniversalLifeTool() {
  const [s, set] = useQueryStates({
    mode: parseAsStringLiteral(MODES.map((m) => m.value)).withDefault("projection"),
    age: parseAsInteger.withDefault(25),
    horizon: parseAsInteger.withDefault(20),
    ul: parseAsInteger.withDefault(200),
    tfsa: parseAsInteger.withDefault(100),
    rate: parseAsFloat.withDefault(7),
    target: parseAsInteger.withDefault(500_000),
    targetAge: parseAsInteger.withDefault(45),
    split: parseAsInteger.withDefault(60),
    childAge: parseAsInteger.withDefault(2),
    ccb: parseAsInteger.withDefault(300),
    ccbSplit: parseAsInteger.withDefault(50),
  });

  const mode = s.mode as Mode;
  const rate = s.rate / 100;

  // A Universal Life policy grows more slowly than the market it tracks: part of
  // every premium buys the insurance. The charge rises with the age you sign at.
  const adultUlRate = ulEffectiveRate(rate, ulCostOfInsuranceDrag(s.age));
  const juvenileUlRate = ulEffectiveRate(rate, JUVENILE_COI_DRAG);

  let streams: Stream[] = [];
  let months = 0;
  let hero = { label: "", value: "", sub: "" };
  let left = { label: "", value: "" };
  let right = { label: "", value: "" };
  let split = { left: 0, right: 0, leftLabel: "", rightLabel: "" };
  let callout: React.ReactNode = null;

  if (mode === "projection") {
    months = s.horizon * 12;
    streams = [
      { monthly: s.tfsa, annualRate: rate },
      { monthly: s.ul, annualRate: adultUlRate },
    ];

    const series = projectSeries(streams, months);
    const end = series[series.length - 1];
    const tfsaLeg = projectSeries([streams[0]], months)[months].value;
    const ulLeg = end.value - tfsaLeg;
    const paidIn = end.principal;

    hero = {
      label: "Combined projected capital",
      value: formatCurrency(end.value),
      sub: `Tax-free by age ${s.age + s.horizon}, from ${formatCurrency(
        s.tfsa + s.ul,
      )} a month`,
    };
    left = { label: "TFSA component", value: formatCurrency(tfsaLeg) };
    right = { label: "Universal Life component", value: formatCurrency(ulLeg) };
    split = {
      left: tfsaLeg,
      right: ulLeg,
      leftLabel: "TFSA",
      rightLabel: "Universal Life",
    };
    callout = (
      <>
        You deposit <strong>{formatCurrency(paidIn)}</strong> over {formatYears(s.horizon)}
        and the position grows to <strong>{formatCurrency(end.value)}</strong>.
        Signing the policy at {s.age} costs you{" "}
        <strong>{formatRate(ulCostOfInsuranceDrag(s.age))}</strong> a year in
        insurance charges, so the Universal Life leg compounds at{" "}
        {formatRate(adultUlRate)} while the TFSA compounds at {formatRate(rate)}.
        Every year you wait widens that gap.
      </>
    );
  } else if (mode === "reverse") {
    const finalTargetAge = clampTargetAge(s.age, s.targetAge);
    months = (finalTargetAge - s.age) * 12;

    const ulShare = s.split / 100;
    const reqUl = solveMonthlyForTarget(s.target * ulShare, adultUlRate, months);
    const reqTfsa = solveMonthlyForTarget(
      s.target * (1 - ulShare),
      rate,
      months,
    );

    streams = [
      { monthly: reqTfsa, annualRate: rate },
      { monthly: reqUl, annualRate: adultUlRate },
    ];

    const totalMonthly = reqUl + reqTfsa;
    const paidIn = totalMonthly * months;

    hero = {
      label: "Required monthly deposit",
      value: `${formatCurrency(totalMonthly)}/mo`,
      sub: `To reach ${formatCurrency(s.target)} by age ${finalTargetAge}`,
    };
    left = { label: "Into the TFSA", value: `${formatCurrency(reqTfsa)}/mo` };
    right = { label: "Into Universal Life", value: `${formatCurrency(reqUl)}/mo` };
    split = {
      left: reqTfsa,
      right: reqUl,
      leftLabel: "TFSA deposit",
      rightLabel: "UL premium",
    };
    callout = (
      <>
        You pay in <strong>{formatCurrency(paidIn)}</strong> and compounding
        supplies the other <strong>{formatCurrency(s.target - paidIn)}</strong>.
        Universal Life carries {s.split}% of the goal but needs{" "}
        <strong>{formatCurrency(reqUl)}</strong> a month against the TFSA&apos;s{" "}
        {formatCurrency(reqTfsa)}, because the insurance charge means it has to
        work harder to arrive at the same place.
      </>
    );
  } else {
    // The benefit stops the month the child turns 18, so the horizon sets itself.
    const horizonYears = Math.max(1, 18 - s.childAge);
    months = horizonYears * 12;

    const ulShare = s.ccbSplit / 100;
    streams = [
      { monthly: s.ccb * (1 - ulShare), annualRate: rate },
      { monthly: s.ccb * ulShare, annualRate: juvenileUlRate },
    ];

    const series = projectSeries(streams, months);
    const end = series[series.length - 1];
    const tfsaLeg = projectSeries([streams[0]], months)[months].value;
    const ulLeg = end.value - tfsaLeg;

    // Left alone from 18 to 30, each leg keeps compounding at its own rate.
    const at30 =
      compoundLumpSum(tfsaLeg, rate, 12) + compoundLumpSum(ulLeg, juvenileUlRate, 12);

    hero = {
      label: "The child's fund at 18",
      value: formatCurrency(end.value),
      sub: `From ${formatCurrency(s.ccb)} a month of child benefit, over ${formatYears(horizonYears)}`,
    };
    left = { label: "Parent's TFSA", value: formatCurrency(tfsaLeg) };
    right = { label: "Juvenile Universal Life", value: formatCurrency(ulLeg) };
    split = {
      left: tfsaLeg,
      right: ulLeg,
      leftLabel: "Parent's TFSA",
      rightLabel: "Juvenile UL",
    };
    callout = (
      <>
        The government pays <strong>{formatCurrency(end.principal)}</strong> in
        child benefit over these {formatYears(horizonYears)}. Reinvested, it becomes{" "}
        <strong>{formatCurrency(end.value)}</strong> by the child&apos;s 18th
        birthday. Left untouched after that, it reaches{" "}
        <strong>{formatCurrency(at30)}</strong> by the time they turn 30, without
        anyone adding another dollar.
      </>
    );
  }

  const series = projectSeries(streams, months);

  return (
    <div className="flex flex-col gap-10">
      <ModeTabs
        modes={MODES}
        value={mode}
        onChange={(v) => set({ mode: v as Mode })}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* Controls */}
        <div className="flex flex-col gap-7">
          {/* 3.html hides the client's age in CCB mode, because the policy is
              written on the child, not the parent. That behaviour is correct. */}
          {mode !== "ccb" ? (
            <Slider
              label="Client's age today"
              display={`${s.age}`}
              value={s.age}
              min={18}
              max={50}
              onChange={(v) => set({ age: v })}
            />
          ) : null}

          {mode === "projection" ? (
            <>
              <Slider
                label="Investment horizon"
                display={formatYears(s.horizon)}
                value={s.horizon}
                min={5}
                max={40}
                onChange={(v) => set({ horizon: v })}
              />
              <Slider
                label="Universal Life premium"
                display={`${formatCurrency(s.ul)}/mo`}
                value={s.ul}
                min={50}
                max={1500}
                step={50}
                onChange={(v) => set({ ul: v })}
              />
              <Slider
                label="TFSA contribution"
                display={`${formatCurrency(s.tfsa)}/mo`}
                value={s.tfsa}
                min={50}
                max={1500}
                step={50}
                onChange={(v) => set({ tfsa: v })}
              />
            </>
          ) : null}

          {mode === "reverse" ? (
            <>
              <Slider
                label="Target"
                display={formatCurrency(s.target)}
                value={s.target}
                min={50_000}
                max={2_500_000}
                step={50_000}
                onChange={(v) => set({ target: v })}
              />
              <Slider
                label="Reach it by age"
                display={`${clampTargetAge(s.age, s.targetAge)}`}
                value={s.targetAge}
                min={30}
                max={70}
                onChange={(v) => set({ targetAge: v })}
              />
              <Slider
                label="Share carried by Universal Life"
                display={`${s.split}% UL / ${100 - s.split}% TFSA`}
                value={s.split}
                min={10}
                max={90}
                step={10}
                onChange={(v) => set({ split: v })}
              />
            </>
          ) : null}

          {mode === "ccb" ? (
            <>
              <Slider
                label="Child's age today"
                display={`${s.childAge}`}
                value={s.childAge}
                min={0}
                max={17}
                onChange={(v) => set({ childAge: v })}
              />
              <Slider
                label="Child benefit reinvested"
                display={`${formatCurrency(s.ccb)}/mo`}
                value={s.ccb}
                min={50}
                max={1500}
                step={50}
                onChange={(v) => set({ ccb: v })}
              />
              <Slider
                label="Share into juvenile Universal Life"
                display={`${s.ccbSplit}% UL / ${100 - s.ccbSplit}% TFSA`}
                value={s.ccbSplit}
                min={10}
                max={90}
                step={10}
                onChange={(v) => set({ ccbSplit: v })}
              />
            </>
          ) : null}

          <Slider
            label="Assumed growth rate"
            display={formatRate(rate)}
            value={s.rate}
            min={3}
            max={12}
            step={0.5}
            onChange={(v) => set({ rate: v })}
          />
        </div>

        {/* Results */}
        <div className="flex flex-col gap-8">
          <Stat hero label={hero.label} value={hero.value} sub={hero.sub} />
          <div className="grid gap-6 sm:grid-cols-2">
            <Stat marked label={left.label} value={left.value} />
            <Stat marked label={right.label} value={right.value} />
          </div>
          <SplitBar
            title="Composition"
            segments={[
              {
                label: split.leftLabel,
                value: split.left,
                color: "var(--color-principal)",
              },
              {
                label: split.rightLabel,
                value: split.right,
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
    </div>
  );
}
