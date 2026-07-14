/**
 * The finance engine. Pure, dependency-free, and the only place compounding math
 * lives — it replaces six drifted copies of the same two functions across
 * reference/html_files.
 *
 * Conventions, fixed once here:
 *  - Rates are DECIMALS (0.07), never percentages. The source files mixed both.
 *  - Deposits are ANNUITY-DUE: paid at the start of the month, earning that
 *    month's growth. Files 1-4 did this; files 5-6 used an ordinary annuity.
 *    Annuity-due is canon, so family projections read ~0.6% higher than 6.html.
 *  - Money is never rounded in here. Rounding is a formatting concern.
 */

/** Future value of a monthly deposit paid at the START of each month. */
export function futureValueAnnuityDue(
  monthly: number,
  annualRate: number,
  months: number,
): number {
  if (months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

/** The monthly deposit needed to reach `target`. Inverse of the above. */
export function solveMonthlyForTarget(
  target: number,
  annualRate: number,
  months: number,
): number {
  if (months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return target / months;
  return target / (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
}

/** Growth of an existing lump sum, compounded annually. */
export function compoundLumpSum(
  present: number,
  annualRate: number,
  years: number,
): number {
  if (years <= 0) return present;
  return present * Math.pow(1 + annualRate, years);
}

// ── Universal Life ──────────────────────────────────────────────────────────

/**
 * Cost-of-insurance drag on a UL policy's growth rate, as a decimal.
 * Rises with entry age: the older you are when the policy is written, the more
 * of each premium is eaten by the insurance charge.
 */
export function ulCostOfInsuranceDrag(entryAge: number): number {
  return 0.005 + Math.max(0, entryAge - 25) * 0.0003;
}

/** Juvenile UL is written at a flat, much lower charge. */
export const JUVENILE_COI_DRAG = 0.001;

/** A UL policy's effective growth rate, floored at 1% however bad the drag. */
export function ulEffectiveRate(annualRate: number, drag: number): number {
  return Math.max(0.01, annualRate - drag);
}

// ── Segregated funds ────────────────────────────────────────────────────────

export type GuaranteeLevel = 75 | 100;

/**
 * The contractual floor: the share of everything you paid in that the insurer
 * guarantees back, regardless of the market.
 */
export function guaranteeFloor(
  totalDeposits: number,
  level: GuaranteeLevel,
): number {
  return totalDeposits * (level / 100);
}

/**
 * A 100% guarantee is not free — it costs 0.4 points of annual return, floored
 * at 0.5%. A 75% guarantee costs nothing extra.
 */
export function segregatedFundRate(
  annualRate: number,
  level: GuaranteeLevel,
): number {
  if (level === 100) return Math.max(0.005, annualRate - 0.004);
  return annualRate;
}

// ── Projection series ───────────────────────────────────────────────────────

/**
 * One funding stream. `contributionMonths` lets a stream stop paying before the
 * horizon ends and simply compound afterwards — which is exactly how the Canada
 * Child Benefit behaves once a child turns 18.
 */
export type Stream = {
  monthly: number;
  annualRate: number;
  contributionMonths?: number;
};

export type SeriesPoint = {
  month: number;
  /** Cumulative deposits — money actually paid in. */
  principal: number;
  /** Deposits plus growth. */
  value: number;
};

/** Value of a single stream after `months`, including any post-funding growth. */
export function streamValueAt(stream: Stream, months: number): number {
  const funding = Math.min(months, stream.contributionMonths ?? months);
  if (funding <= 0) return 0;
  const atFundingEnd = futureValueAnnuityDue(
    stream.monthly,
    stream.annualRate,
    funding,
  );
  const idleMonths = months - funding;
  if (idleMonths <= 0) return atFundingEnd;
  return atFundingEnd * Math.pow(1 + stream.annualRate / 12, idleMonths);
}

/** Deposits paid into a single stream by `months`. */
export function streamPrincipalAt(stream: Stream, months: number): number {
  const funding = Math.min(months, stream.contributionMonths ?? months);
  return stream.monthly * Math.max(0, funding);
}

/**
 * Month-by-month principal and value across every stream — the series the hero
 * curve draws. None of the source files computed this; they only ever showed
 * endpoints, which is why every "chart" in them was a percentage bar.
 */
export function projectSeries(
  streams: Stream[],
  horizonMonths: number,
): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  const last = Math.max(0, Math.floor(horizonMonths));
  for (let m = 0; m <= last; m++) {
    let principal = 0;
    let value = 0;
    for (const s of streams) {
      principal += streamPrincipalAt(s, m);
      value += streamValueAt(s, m);
    }
    points.push({ month: m, principal, value });
  }
  return points;
}

// ── Canada Child Benefit ────────────────────────────────────────────────────

/**
 * The CCB stops the month a child turns 18. Anything banked before then keeps
 * compounding to the end of the planning horizon.
 */
export function ccbStream(
  childAge: number,
  monthly: number,
  annualRate: number,
): Stream {
  const eligibleMonths = Math.max(0, (18 - childAge) * 12);
  return { monthly, annualRate, contributionMonths: eligibleMonths };
}

export function ccbFutureValue(
  childAge: number,
  monthly: number,
  annualRate: number,
  horizonMonths: number,
): number {
  return streamValueAt(ccbStream(childAge, monthly, annualRate), horizonMonths);
}

// ── Guards the originals got wrong ──────────────────────────────────────────

/** A reverse-target horizon must be at least 5 years out. From 2.html/3.html. */
export const MIN_TARGET_HORIZON_YEARS = 5;

export function clampTargetAge(startAge: number, targetAge: number): number {
  return Math.max(startAge + MIN_TARGET_HORIZON_YEARS, targetAge);
}
