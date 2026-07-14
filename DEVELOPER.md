# Notes for whoever works on this next

Read this before you change anything. Several decisions in here look wrong until you know why they were made, and a couple of them will bite you.

The companion documents: `FORMULAS.md` explains the math, `CONTENT_LOCATIONS.md` tells you where each piece of on-screen text lives.

## What this is

Three interactive financial illustrations for a Canadian wealth advisor. A client sits with the advisor, the advisor drags a slider, and a number and a curve move. That is the whole product.

It replaces six standalone HTML files, kept in `reference/html_files/`. Those six were really three tools with version history: `1 -> 2 -> 3` and `5 -> 6` were each a chain where the later file strictly contained the earlier one, and `4` stood alone. So `3`, `4`, and `6` became the three routes here, and `1`, `2`, and `5` were not ported. Nothing was lost.

## Commands

```
npm run dev      # http://localhost:3000
npm run build    # production build
npm test         # the finance engine test suite
npm run lint
```

**Do not run `npm run build` while `npm run dev` is running.** They both write to `.next` and the dev server dies with no error message, just a bare terminal escape code. This will look like a crash in your code. It is not.

## The shape of the thing

```
src/
  lib/finance.ts        every formula on the site
  lib/finance.test.ts   the tests that keep it honest
  lib/format.ts         currency, percentages, pluralised years
  config/brand.ts       advisor identity, all legal disclaimers
  components/ui/        sliders, tabs, stats, the shell
  components/chart/     the projection curve and the ledger table
  app/<tool>/page.tsx   server: metadata, headline, accent
  app/<tool>/Tool.tsx   client: state, math calls, layout
```

`app/page.tsx` and `app/SpecimenControls.tsx` are **scaffolding**, not product. They are a specimen page built to review the palette and the components in isolation. They should be deleted when the real landing page lands.

## Rules that are load-bearing

### All math lives in finance.ts

No component does arithmetic. A `Tool.tsx` reads its state, calls into `finance.ts`, and renders the answer. If you find yourself writing a formula inside a component, stop, and put it in `finance.ts` with a test.

This exists because the six original files each carried their own copy of the same two functions, and the copies had drifted apart. Files 1 through 4 compounded deposits one way and files 5 and 6 compounded them another, so the same inputs gave different answers depending on which page you happened to open. The whole point of this rewrite is that there is now exactly one answer.

### Rates are decimals

`0.07`, never `7`. The originals mixed the two and converted at unpredictable moments. Every function in `finance.ts` takes a decimal. Percentages exist only at the point of display, in `format.ts`.

The one place this leaks: sliders bind to whole percentages because that is what a slider step wants, so you will see `rate: parseAsFloat.withDefault(7)` in the URL state and `const rate = s.rate / 100` immediately after. That division is deliberate and belongs there.

### Deposits land at the start of the month

An annuity-due. Every deposit earns growth in the month you make it. This was a decision, not an accident, and it means the family tool now reports about 0.6% more than `6.html` did on identical inputs. There is a test asserting that exact gap so nobody can quietly undo it. See `FORMULAS.md`.

### The accent colour is late-bound

A tool sets `data-accent="amber"` on its root element, `globals.css` maps that to `--accent`, and every component underneath reads `var(--color-accent)`. This is why there is one `Slider`, not three.

If you build a new component that needs the tool's colour, use the `accent` Tailwind class or `var(--color-accent)`. Never hardcode a hex.

### Colours were chosen by a contrast checker

Read the comments in `globals.css` before changing any colour. Two values in there are not aesthetic choices. The `principal` grey and the `amber` accent were both originally much lighter and both failed a contrast check against the near-white background, badly enough that they would have been effectively invisible as chart fills. They were darkened until they passed. Brightening them back up will break the charts for anybody who is not looking at your monitor in your lighting.

## The chart

`components/chart/ProjectionCurve.tsx` is hand-rolled SVG on `d3-scale` and `d3-shape`. There is no chart library. That is on purpose: the flat, hard-edged look would have meant fighting a library's defaults the whole way.

Two things in it are worth knowing.

**It resamples to a fixed 120 points.** `SAMPLES = 120`, always, regardless of how long the plan is. This is what makes the tween possible: two arrays of the same length can be interpolated element by element. If you make the sample count depend on the horizon, the arrays change length whenever a slider moves and the curve will snap instead of morphing. `useTweenedArray` detects a length change and snaps deliberately, so it will not crash, it will just look wrong.

**The guarantee floor is drawn in ink, not in the accent colour.** That is deliberate. The floor is a term of the insurance contract, not a data series, and colouring it like the data would suggest it is the same kind of thing. It is the one bold moment on the page and everything else stays quiet to pay for it.

The curve draws `principal` (grey, money paid in) with `growth` (accent) stacked on top. **Those two bands never swap meaning, in any tool.** A user who learns the chart on one page can read it on all three.

### The ledger is not optional

`components/chart/Ledger.tsx` renders the same data as a table. It is there because a coloured area chart conveys nothing to a screen reader, to somebody who cannot distinguish the colours, or to a printed page. It is also the artifact the whole design imitates, which is a printed policy illustration. Do not remove it to save space.

## State lives in the URL

Every slider and every tab is a URL parameter, via `nuqs`. An advisor can configure an illustration and send the link to a client, and the client sees the same numbers.

Consequences:

- **Do not rename a `MODES` value or a `useQueryStates` key.** The `label` is what people read and you can change it freely. The `value` and the key go into the URL, and changing one breaks every link anybody has already sent.
- Every `Tool.tsx` is wrapped in `<Suspense>` in its `page.tsx`. `nuqs` requires it. Remove it and the build fails at prerender.
- The app is wrapped in `NuqsAdapter` in `app/layout.tsx`.
- Inputs from the URL are not validated. Somebody can hand-edit `?rate=9999`. The math will not crash, because the engine guards its own edge cases, but the chart will look absurd. If this site is ever exposed somewhere it matters, clamp the parsed values.

## Testing

`npm test` runs `src/lib/finance.test.ts`. It is the only test file and it covers the only code that can be meaningfully wrong.

The golden values in it were produced by **running the original HTML files' own functions in node** and capturing the output. They are not values somebody typed in by hand. That means the tests prove the port is faithful to the source behaviour, and any accidental drift fails loudly.

The suite also covers the cases the originals mishandled: a zero rate, a zero-length horizon, an insurance charge heavy enough to push a rate below its own floor, a child who has already turned 18, and a plan shorter than a child's benefit eligibility.

**If a test fails and you are confident the new answer is right, change the golden value and explain why in the commit message. Do not delete the test.**

## Things that will trip you up

**The numbers printed in the original HTML files are wrong.** `3.html` shows $141,586 on load; its own code computes $151,012. `4.html` shows $158,340; its code computes $167,196. Those are stale placeholders that were never regenerated after the formulas changed, and the pages overwrite them the instant a slider moves. If you are comparing against the originals to check a port, drag a slider first, or just trust the tests.

**The originals' sliders only worked in Chrome.** They styled `::-webkit-slider-thumb` and nothing else, so Firefox rendered a default OS slider, and none of them were keyboard operable. Everything here is built on Radix for that reason. If you add a new control, use Radix, or you will quietly reintroduce the bug.

**`Math.min(months, contributionMonths)` is doing real work.** A funding stream can stop before the plan ends. That is how the child benefit behaves: it pays until 18 and then the pot just compounds. Get this wrong and you will pay benefits to a 40-year-old, which is what the originals did.

## Deployment

Vercel. The build is fully static: all three tools prerender, and every calculation happens in the browser. There is no server, no database, and no API. Nothing a user types leaves their machine.
