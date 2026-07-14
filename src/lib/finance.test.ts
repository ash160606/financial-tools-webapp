import { describe, it, expect } from "vitest";
import {
  futureValueAnnuityDue,
  solveMonthlyForTarget,
  compoundLumpSum,
  ulCostOfInsuranceDrag,
  ulEffectiveRate,
  JUVENILE_COI_DRAG,
  guaranteeFloor,
  segregatedFundRate,
  projectSeries,
  streamValueAt,
  ccbStream,
  ccbFutureValue,
  clampTargetAge,
} from "./finance";

/**
 * Golden values were produced by running the ORIGINAL functions from
 * reference/html_files/{3,4,6}.html verbatim in node, at each file's own default
 * slider positions. They pin the port to the source behaviour.
 *
 * Note: they do NOT match the figures hardcoded in the originals' markup
 * (3.html says "$141,586", 4.html says "$158,340"). That static text was written
 * before the math changed and is stale — the files overwrite it with these
 * values the moment any slider moves. We follow the code, not the placeholder.
 */

const CENT = 2; // assert to the cent; these are money

describe("core compounding", () => {
  it("annuity-due matches the originals' calculateAnnuityFV", () => {
    // $100/mo, 7%, 20y — the TFSA leg of 3.html's defaults
    expect(futureValueAnnuityDue(100, 0.07, 240)).toBeCloseTo(52396.53986745, CENT);
  });

  it("earns growth in the deposit month (due, not ordinary)", () => {
    // One month at 12%/yr: a start-of-month deposit earns that month's 1%.
    expect(futureValueAnnuityDue(100, 0.12, 1)).toBeCloseTo(101, CENT);
    // The ordinary-annuity answer would be exactly 100. This is the +$5,952
    // shift on family-legacy's defaults, and it is intended.
  });

  it("degrades to simple accumulation at a zero rate", () => {
    expect(futureValueAnnuityDue(250, 0, 120)).toBe(30000);
  });

  it("returns zero for a non-positive horizon", () => {
    expect(futureValueAnnuityDue(500, 0.07, 0)).toBe(0);
    expect(futureValueAnnuityDue(500, 0.07, -12)).toBe(0);
  });

  it("solveMonthlyForTarget inverts futureValueAnnuityDue", () => {
    const monthly = solveMonthlyForTarget(500_000, 0.07, 240);
    expect(futureValueAnnuityDue(monthly, 0.07, 240)).toBeCloseTo(500_000, CENT);
  });

  it("solveMonthlyForTarget handles a zero rate and a zero horizon", () => {
    expect(solveMonthlyForTarget(120_000, 0, 240)).toBe(500);
    expect(solveMonthlyForTarget(120_000, 0.07, 0)).toBe(0);
  });

  it("compoundLumpSum rolls a balance forward annually", () => {
    expect(compoundLumpSum(100_000, 0.07, 10)).toBeCloseTo(196_715.1357, 4);
    expect(compoundLumpSum(100_000, 0.07, 0)).toBe(100_000);
  });
});

describe("universal life cost-of-insurance drag (3.html)", () => {
  it("is 0.5% at the reference entry age of 25", () => {
    expect(ulCostOfInsuranceDrag(25)).toBeCloseTo(0.005, 6);
  });

  it("rises with entry age", () => {
    expect(ulCostOfInsuranceDrag(45)).toBeCloseTo(0.011, 6);
  });

  it("does not go below the floor for entry ages under 25", () => {
    expect(ulCostOfInsuranceDrag(18)).toBeCloseTo(0.005, 6);
  });

  it("floors the effective rate at 1%", () => {
    // A 3% assumption against a heavy drag must not fall through the floor.
    expect(ulEffectiveRate(0.03, ulCostOfInsuranceDrag(90))).toBe(0.01);
  });

  it("reproduces 3.html Mode A at its defaults (age 25, 20y, UL 200, TFSA 100, 7%)", () => {
    const tfsa = futureValueAnnuityDue(100, 0.07, 240);
    const ulRate = ulEffectiveRate(0.07, ulCostOfInsuranceDrag(25));
    const ul = futureValueAnnuityDue(200, ulRate, 240);

    expect(ulRate).toBeCloseTo(0.065, 6);
    expect(tfsa).toBeCloseTo(52396.53986745, CENT);
    expect(ul).toBeCloseTo(98615.47525635, CENT);
    expect(tfsa + ul).toBeCloseTo(151012.01512380, CENT);
  });

  it("reproduces 3.html Mode A at age 45, where the drag bites", () => {
    const ulRate = ulEffectiveRate(0.07, ulCostOfInsuranceDrag(45));
    expect(ulRate).toBeCloseTo(0.059, 6);
    expect(futureValueAnnuityDue(200, ulRate, 240)).toBeCloseTo(91770.14380968, CENT);
  });

  it("reproduces 3.html Mode B (reverse target: 500k by 45, 60% UL)", () => {
    const ulRate = ulEffectiveRate(0.07, ulCostOfInsuranceDrag(25));
    const reqUL = solveMonthlyForTarget(500_000 * 0.6, ulRate, 240);
    const reqTFSA = solveMonthlyForTarget(500_000 * 0.4, 0.07, 240);

    expect(reqUL).toBeCloseTo(608.42377775, CENT);
    expect(reqTFSA).toBeCloseTo(381.70459444, CENT);
    expect(reqUL + reqTFSA).toBeCloseTo(990.12837219, CENT);
  });

  it("reproduces 3.html Mode C (CCB shelter: child 2, $300/mo, 50/50)", () => {
    const months = (18 - 2) * 12;
    const ulRate = ulEffectiveRate(0.07, JUVENILE_COI_DRAG);
    const tfsa = futureValueAnnuityDue(150, 0.07, months);
    const ul = futureValueAnnuityDue(150, ulRate, months);

    expect(ulRate).toBeCloseTo(0.069, 6);
    expect(tfsa).toBeCloseTo(53148.45140846, CENT);
    expect(ul).toBeCloseTo(52649.30487491, CENT);
    expect(tfsa + ul).toBeCloseTo(105797.75628336, CENT);

    // Left alone from 18 to 30, annually compounded.
    const at30 = compoundLumpSum(tfsa, 0.07, 12) + compoundLumpSum(ul, ulRate, 12);
    expect(at30).toBeCloseTo(236953.80324060, CENT);
  });
});

describe("segregated funds (4.html)", () => {
  it("charges 0.4 points of return for the 100% guarantee, and nothing for 75%", () => {
    expect(segregatedFundRate(0.075, 75)).toBeCloseTo(0.075, 6);
    expect(segregatedFundRate(0.075, 100)).toBeCloseTo(0.071, 6);
  });

  it("floors the 100% guarantee's rate at 0.5%", () => {
    expect(segregatedFundRate(0.005, 100)).toBe(0.005);
  });

  it("guarantees the stated share of deposits", () => {
    expect(guaranteeFloor(86_400, 75)).toBe(64_800);
    expect(guaranteeFloor(86_400, 100)).toBe(86_400);
  });

  it("reproduces 4.html at its defaults (16y, $450/mo, 7.5%), 75% guarantee", () => {
    const rate = segregatedFundRate(0.075, 75);
    expect(futureValueAnnuityDue(450, rate, 192)).toBeCloseTo(167195.85296050, CENT);
    expect(guaranteeFloor(450 * 192, 75)).toBe(64_800);
  });

  it("reproduces 4.html at its defaults, 100% guarantee (the safer, slower path)", () => {
    const rate = segregatedFundRate(0.075, 100);
    expect(futureValueAnnuityDue(450, rate, 192)).toBeCloseTo(160960.05684491, CENT);
    expect(guaranteeFloor(450 * 192, 100)).toBe(86_400);
  });
});

describe("Canada Child Benefit streams (6.html)", () => {
  it("stops paying at 18 but keeps compounding to the horizon", () => {
    // Child aged 4, 20-year horizon: 14 years of benefit, then 6 idle years.
    const s = ccbStream(4, 450, 0.075);
    expect(s.contributionMonths).toBe(168);

    const fundedOnly = futureValueAnnuityDue(450, 0.075, 168);
    const withIdleGrowth = streamValueAt(s, 240);
    expect(withIdleGrowth).toBeGreaterThan(fundedOnly);
    expect(withIdleGrowth).toBeCloseTo(
      fundedOnly * Math.pow(1 + 0.075 / 12, 72),
      CENT,
    );
  });

  it("pays nothing for a child already 18", () => {
    expect(ccbFutureValue(18, 450, 0.075, 240)).toBe(0);
    expect(ccbFutureValue(25, 450, 0.075, 240)).toBe(0);
  });

  it("does not pay past 18 even on a horizon shorter than eligibility", () => {
    // Child 2 (16y eligible) but only a 5-year plan: funding caps at the horizon.
    const s = ccbStream(2, 300, 0.07);
    expect(streamValueAt(s, 60)).toBeCloseTo(
      futureValueAnnuityDue(300, 0.07, 60),
      CENT,
    );
  });

  it("reproduces 6.html's family defaults, normalised to annuity-due", () => {
    // Husband 500 + wife 500, 20y, 7.5%, two kids aged 4 and 6 at $450/mo each.
    const months = 240;
    const spouse = futureValueAnnuityDue(500, 0.075, months);
    const ccb =
      ccbFutureValue(4, 450, 0.075, months) + ccbFutureValue(6, 450, 0.075, months);

    expect(spouse).toBeCloseTo(278595.77102815, CENT);
    expect(ccb).toBeCloseTo(401140.93987624, CENT);
    expect(spouse * 2 + ccb).toBeCloseTo(958332.48193254, CENT);

    // 6.html's ordinary-annuity original gave 952,380.11 on the same inputs.
    // The +$5,952 gap is the intended annuity-due normalisation.
    expect(spouse * 2 + ccb - 952380.10626836).toBeCloseTo(5952.38, 2);
  });
});

describe("projectSeries", () => {
  it("starts at zero and ends at the closed-form value", () => {
    const series = projectSeries([{ monthly: 500, annualRate: 0.07 }], 240);

    expect(series).toHaveLength(241); // month 0 through 240 inclusive
    expect(series[0]).toEqual({ month: 0, principal: 0, value: 0 });

    const end = series[240];
    expect(end.principal).toBe(500 * 240);
    expect(end.value).toBeCloseTo(futureValueAnnuityDue(500, 0.07, 240), CENT);
  });

  it("never lets value fall below principal at a positive rate", () => {
    const series = projectSeries([{ monthly: 500, annualRate: 0.07 }], 240);
    for (const p of series) {
      expect(p.value).toBeGreaterThanOrEqual(p.principal - 1e-9);
    }
  });

  it("sums independent streams, each at its own rate", () => {
    const series = projectSeries(
      [
        { monthly: 100, annualRate: 0.07 },
        { monthly: 200, annualRate: 0.065 },
      ],
      240,
    );
    const end = series[240];
    expect(end.principal).toBe(300 * 240);
    expect(end.value).toBeCloseTo(151012.01512380, CENT); // 3.html Mode A total
  });

  it("flattens principal once a CCB stream stops, while value keeps rising", () => {
    // Child 16: two years of benefit inside a ten-year plan.
    const series = projectSeries([ccbStream(16, 450, 0.075)], 120);

    expect(series[24].principal).toBe(450 * 24);
    expect(series[120].principal).toBe(450 * 24); // no further deposits
    expect(series[120].value).toBeGreaterThan(series[24].value); // still growing
  });

  it("handles a zero horizon without producing garbage", () => {
    expect(projectSeries([{ monthly: 500, annualRate: 0.07 }], 0)).toEqual([
      { month: 0, principal: 0, value: 0 },
    ]);
  });
});

describe("target-age clamp (the guard 2.html/3.html bolt on after the fact)", () => {
  it("pushes a too-near target out to the five-year minimum", () => {
    expect(clampTargetAge(40, 42)).toBe(45);
  });

  it("leaves a valid target alone", () => {
    expect(clampTargetAge(25, 45)).toBe(45);
  });
});
