# The math behind each illustration

Every number this site prints comes from one file: `src/lib/finance.ts`. Nothing else does arithmetic. If a figure looks wrong, the bug is in there, and `src/lib/finance.test.ts` will tell you which function broke.

This document explains what each formula does, why it does it, and where each tool uses it. Read it before you change any of the math, because several of these choices are deliberate and will look like mistakes if you do not know the reasoning.

## Two conventions that apply everywhere

**Rates are decimals.** A 7% return is `0.07`, never `7`. The original HTML files mixed the two and converted at unpredictable moments, which is how they ended up with bugs. The engine now takes decimals and only converts to a percentage at the point of display.

**Deposits land at the start of the month.** This is an annuity-due, and it means every deposit earns growth in the month you make it. The alternative, an ordinary annuity, assumes the deposit earns nothing until the following month.

That choice matters. The old files disagreed with each other about it: files 1 through 4 used an annuity-due, files 5 and 6 used an ordinary annuity. The same inputs therefore produced different answers depending on which page you happened to open. The engine now uses an annuity-due everywhere. The visible consequence is that the Family and Legacy tool now reports roughly $5,952 more on its default inputs than 6.html did. That gap is intended, and a test asserts it so nobody can quietly reintroduce the inconsistency.

## The core formula

Everything on this site is built on one equation, the future value of a stream of equal monthly deposits:

```
FV = PMT x ((1 + r)^n - 1) / r x (1 + r)
```

`PMT` is the monthly deposit, `r` is the monthly rate (the annual rate divided by 12), and `n` is the number of months. The trailing `(1 + r)` is the annuity-due factor. Drop it and you get the ordinary-annuity answer.

In code: `futureValueAnnuityDue(monthly, annualRate, months)`.

When the rate is zero the equation divides by zero, so the function short-circuits and returns `PMT x n`. The original files handled this too, and it is the reason a 0% growth assumption does not blow up the page.

### Running it backwards

Given a target and a deadline, you can solve for the deposit that gets you there. Rearrange the same equation for `PMT`:

```
PMT = FV / ( ((1 + r)^n - 1) / r x (1 + r) )
```

In code: `solveMonthlyForTarget(target, annualRate, months)`. This powers every "Reverse Target" mode. It is a true inverse, and a test confirms that feeding its output back into `futureValueAnnuityDue` returns the original target.

### Growing a balance you already have

```
FV = PV x (1 + annualRate)^years
```

In code: `compoundLumpSum(present, annualRate, years)`. This compounds annually rather than monthly, because it models a pot you stop feeding and leave alone. The TFSA and Universal Life tool uses it to roll a child's fund forward from age 18 to age 30.

## Streams, and why the curve exists

The old files only ever calculated two numbers: what you paid in, and what you ended up with. They knew nothing about the years in between, which is why every "chart" in them was a percentage bar rather than a real graph.

`projectSeries(streams, horizonMonths)` fixes that. It walks month by month and returns, for each month, how much you have paid in so far and what the position is worth. The hero curve on every page draws that series directly.

A `Stream` is one source of money:

```ts
{ monthly: 450, annualRate: 0.075, contributionMonths: 168 }
```

`contributionMonths` is the important field. It lets a stream stop paying before the plan ends and simply compound from there. Set it and the principal line goes flat while the value line keeps climbing. That is exactly how the Canada Child Benefit behaves, and it is the one piece of behaviour the old files got right but expressed as a tangle of inline conditionals.

A tool can pass as many streams as it likes, each at its own rate, and `projectSeries` sums them. That is how a TFSA growing at 7% and a Universal Life policy growing at 6.5% appear on one chart without the code special-casing anything.

## Universal Life carries a drag

A Universal Life policy is not a fund. Part of every premium pays for the insurance, so the policy grows more slowly than the market it tracks. The engine models that as a subtraction from the growth rate:

```
drag = 0.005 + max(0, entryAge - 25) x 0.0003
effectiveRate = max(0.01, annualRate - drag)
```

In code: `ulCostOfInsuranceDrag(entryAge)` and `ulEffectiveRate(annualRate, drag)`.

Read it as: the policy costs you half a percentage point a year at minimum, and another 0.03 points for every year past 25 you were when you bought it. Buy at 25 and you give up 0.5%. Buy at 45 and you give up 1.1%. This is the whole argument for starting young, and it is why the tool makes entry age a slider rather than a form field.

The `max(0.01, ...)` floor stops a low growth assumption and a heavy drag from combining into a negative rate.

Children get a flat, much cheaper charge, `JUVENILE_COI_DRAG = 0.001`, because insuring a two-year-old costs almost nothing.

**One warning.** 3.html's markup displays $94,391 for the Universal Life component on page load, which is exactly twice the TFSA figure beside it. That can only happen if Universal Life earns the same rate as the TFSA, which contradicts the drag its own code applies. Somebody hardcoded that number before the drag existed and never regenerated it. The real figure is $98,615. Do not use the old page's printed numbers to check your work; use the tests.

## Segregated funds buy a floor

A segregated fund is a mutual fund wrapped in an insurance contract. The contract guarantees you get back a fixed share of everything you paid in, no matter what the market does.

```
floor = totalDeposits x (level / 100)
```

In code: `guaranteeFloor(totalDeposits, level)`, where `level` is 75 or 100.

Note what the floor is calculated on: **deposits, not value**. The guarantee protects the money you handed over, not the growth on top of it. A 75% guarantee on $86,400 of deposits promises you $64,800 back, and it says nothing at all about the $167,196 the fund may have grown to. The chart draws the floor as a flat horizontal line under the curve for exactly this reason. The two quantities are different things and the picture should not let you confuse them.

The stronger guarantee is not free:

```
effectiveRate = level === 100 ? max(0.005, annualRate - 0.004) : annualRate
```

In code: `segregatedFundRate(annualRate, level)`. Choosing the 100% guarantee costs you 0.4 percentage points of annual return. On the default inputs that trade looks like this: the floor rises from $64,800 to $86,400, and the projected value falls from $167,196 to $160,960. You pay about $6,200 of upside to protect about $21,600 of downside. Whether that is a good deal is the client's call, and showing them both sides of it is the entire point of the tool.

## The Canada Child Benefit stops at 18

The government pays the benefit until the child turns 18, then stops. Money you already banked keeps compounding.

`ccbStream(childAge, monthly, annualRate)` builds a stream with `contributionMonths` set to `(18 - childAge) x 12`, which the projection engine then handles without any further special cases. A child who is already 18 gets a stream with zero contribution months, which contributes nothing. The old files did not guard this, and would happily pay benefits for a 25-year-old.

`ccbFutureValue(childAge, monthly, annualRate, horizonMonths)` is the same thing evaluated at a single point, for the pages that only need the endpoint.

Two behaviours fall out of this that are worth stating plainly, because they surprise people:

- A short plan truncates the benefit. If the child is 2 but you only model 5 years, you get 5 years of deposits, not 16.
- A long plan does not extend it. If the child is 16 but you model 10 years, you get 2 years of deposits followed by 8 years of growth on them.

## What each page uses

### TFSA and Universal Life (`/tfsa-universal-life`, from 3.html)

Accent colour: ultramarine.

**Projection.** Two streams, a TFSA at the assumed rate and a Universal Life policy at that rate minus its age-based drag. Both run for the full horizon. The tool reports each leg, the combined total, and the split between them.

**Reverse Target.** Splits the target between the two vehicles by the allocation you pick, then runs `solveMonthlyForTarget` against each at its own rate. Because Universal Life grows more slowly, it always needs the larger monthly deposit to carry the same share of the goal, which is the insight the mode exists to surface.

The target age is clamped to at least 5 years past the start age by `clampTargetAge`. Without that guard the horizon can reach zero and the solver divides by zero.

**CCB Shelter.** Routes a child benefit into a juvenile Universal Life policy and a parent's TFSA. It runs to the child's 18th birthday, then reports what the pot becomes by age 30 if nobody touches it, using `compoundLumpSum`.

### Segregated Funds (`/segregated-funds`, from 4.html)

Accent colour: amber.

One stream, at `segregatedFundRate(rate, level)`. The page pairs the projected value against `guaranteeFloor(deposits, level)` and draws the floor on the chart. Switching the guarantee from 75% to 100% raises the floor and bends the curve down at the same time, in one gesture, which is the trade the page is built to show.

Everything else on the page (probate bypass, creditor protection, annual resets) describes features of the insurance contract and involves no arithmetic.

### Family and Legacy (`/family-legacy`, from 6.html)

Accent colour: vermilion.

**Accumulation.** One stream per spouse, plus one CCB stream per child, all summed. The children's streams stop at 18 while the spouses' run the full horizon, so the composition of the total shifts over time on its own.

**Reverse Target.** Subtracts the projected future value of the benefit streams from the target first, then solves for what the spouses must contribute to close the remaining gap. It splits that requirement evenly between them. This ordering matters: the benefit money is already committed and free, so it should reduce the bill before anyone is asked to fund the rest.

Every figure on this page reads higher than 6.html did, by roughly 0.6%, because of the annuity-due normalisation described at the top.

## If you change something

Run `npm test`. The suite pins each tool against golden values extracted by running the original files' own functions, so any accidental drift from the source behaviour fails loudly. The tests also cover the cases the originals mishandled: a zero rate, a zero-length horizon, a drag heavy enough to push the rate through its floor, and a child who has already aged out of the benefit.

If a test fails and you believe the new answer is the correct one, change the golden value and say why in the commit. Do not delete the test.
