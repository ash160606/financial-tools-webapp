"use client";

import { useQueryStates, parseAsInteger, parseAsFloat } from "nuqs";
import { Slider } from "@/components/ui/Slider";
import { Choice } from "@/components/ui/Choice";
import { Stat } from "@/components/ui/Stat";
import { Callout } from "@/components/ui/Callout";
import { ProjectionCurve } from "@/components/chart/ProjectionCurve";
import { Ledger } from "@/components/chart/Ledger";
import {
  projectSeries,
  guaranteeFloor,
  segregatedFundRate,
  futureValueAnnuityDue,
  type GuaranteeLevel,
} from "@/lib/finance";
import { formatCurrency, formatRate, formatYears } from "@/lib/format";

const CONTRACT_TERMS = [
  {
    title: "The beneficiary is named in the contract",
    body: "The payout goes straight to your child. It never enters the estate, so it skips probate, which in Canada takes between 1.5% and 5% of what passes through it.",
  },
  {
    title: "You can reset the floor upward",
    body: "Most contracts let you lock in a new high once a year. If the fund runs up, that peak becomes your new guaranteed minimum, and it never goes back down.",
  },
  {
    title: "Creditors cannot reach it",
    body: "It is an insurance contract, not an investment account, so it carries creditor protection that a mutual fund does not.",
  },
];

export function SegregatedFundsTool() {
  const [s, set] = useQueryStates({
    childAge: parseAsInteger.withDefault(2),
    horizon: parseAsInteger.withDefault(16),
    monthly: parseAsInteger.withDefault(450),
    rate: parseAsFloat.withDefault(7.5),
    guarantee: parseAsInteger.withDefault(75),
  });

  const level = (s.guarantee === 100 ? 100 : 75) as GuaranteeLevel;
  const assumedRate = s.rate / 100;

  // The stronger guarantee is not free: it costs 0.4 points of annual return.
  const effectiveRate = segregatedFundRate(assumedRate, level);

  const months = s.horizon * 12;
  const series = projectSeries(
    [{ monthly: s.monthly, annualRate: effectiveRate }],
    months,
  );
  const end = series[series.length - 1];

  const deposits = end.principal;
  const floor = guaranteeFloor(deposits, level);

  // What the other choice would have produced, so the trade is a number and not
  // a feeling. This is the whole point of the page.
  const otherLevel: GuaranteeLevel = level === 75 ? 100 : 75;
  const otherValue = futureValueAnnuityDue(
    s.monthly,
    segregatedFundRate(assumedRate, otherLevel),
    months,
  );
  const otherFloor = guaranteeFloor(deposits, otherLevel);
  const upsideGap = Math.abs(end.value - otherValue);
  const floorGap = Math.abs(floor - otherFloor);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="flex flex-col gap-7">
          <Slider
            label="Child's age today"
            display={`${s.childAge}`}
            value={s.childAge}
            min={0}
            max={17}
            onChange={(v) => set({ childAge: v })}
          />
          <Slider
            label="Years of benefit invested"
            display={formatYears(s.horizon)}
            value={s.horizon}
            min={1}
            max={30}
            onChange={(v) => set({ horizon: v })}
          />
          <Slider
            label="Child benefit invested"
            display={`${formatCurrency(s.monthly)}/mo`}
            value={s.monthly}
            min={50}
            max={1500}
            step={50}
            onChange={(v) => set({ monthly: v })}
          />
          <Slider
            label="Assumed annual return"
            display={formatRate(assumedRate)}
            value={s.rate}
            min={3}
            max={12}
            step={0.5}
            onChange={(v) => set({ rate: v })}
          />
          <Choice
            label="Guarantee level"
            value={level}
            options={[
              { value: 75, label: "75%", hint: "Costs nothing extra" },
              { value: 100, label: "100%", hint: "Costs 0.4% a year" },
            ]}
            onChange={(v) => set({ guarantee: v })}
          />
        </div>

        <div className="flex flex-col gap-8">
          <Stat
            hero
            label="Projected value"
            value={formatCurrency(end.value)}
            sub={`At ${formatRate(effectiveRate)} net of the guarantee's cost, by the child's age ${
              s.childAge + s.horizon
            }`}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Stat
              marked
              label="Guaranteed floor"
              value={formatCurrency(floor)}
              sub={`${level}% of the ${formatCurrency(deposits)} you deposit`}
            />
            <Stat
              marked
              label="Passes to the child"
              value="Directly"
              sub="Named beneficiary, so it skips probate entirely"
            />
          </div>

          <Callout title="The trade you are making">
            The {level}% guarantee protects{" "}
            <strong>{formatCurrency(floor)}</strong> of the{" "}
            {formatCurrency(deposits)} you pay in.{" "}
            {level === 75 ? (
              <>
                Moving to a 100% guarantee would protect{" "}
                <strong>{formatCurrency(floorGap)}</strong> more, and cost you
                about <strong>{formatCurrency(upsideGap)}</strong> of projected
                growth to do it.
              </>
            ) : (
              <>
                Dropping to a 75% guarantee would hand back about{" "}
                <strong>{formatCurrency(upsideGap)}</strong> of projected growth,
                and give up <strong>{formatCurrency(floorGap)}</strong> of
                protection to get it.
              </>
            )}{" "}
            The floor is calculated on what you deposit, never on what the fund
            grows to. That is why the line on the chart is flat.
          </Callout>
        </div>
      </div>

      <div>
        <ProjectionCurve
          series={series}
          floor={{ value: floor, label: `${level}% floor` }}
        />
        <div className="mt-6">
          <Ledger series={series} />
        </div>
      </div>

      <div className="grid gap-px border border-ink bg-ink md:grid-cols-3">
        {CONTRACT_TERMS.map((t) => (
          <div key={t.title} className="bg-paper p-5">
            <h3 className="display text-base">{t.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
