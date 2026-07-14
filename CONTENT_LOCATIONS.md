# Where every piece of text lives

This is the map you want when somebody says "change the wording on the second card" or "that number is wrong" and you do not want to grep the whole repo.

Nothing here requires you to understand the math. If you want that, read `FORMULAS.md`.

## Start here: the things you are most likely to change

| You want to change | Open this | Look for |
| --- | --- | --- |
| **The legal wording** | `src/config/brand.ts` | `compliance` (read the next section first) |
| The advisor's name or firm | `src/config/brand.ts` | `brand.advisor`, `brand.firm` |
| A tool's own disclaimer | `src/config/brand.ts` | `disclaimers` |
| A tool's name, summary, or colour | `src/config/brand.ts` | `tools` |
| The landing page | `src/app/page.tsx` | the whole file |
| A page's headline or intro paragraph | `src/app/<tool>/page.tsx` | `title`, `intro` |
| A slider's label or its range | `src/app/<tool>/Tool.tsx` | the `<Slider>` calls |
| The text under a big number | `src/app/<tool>/Tool.tsx` | `hero`, `cards`, `left`, `right` |
| The "what this means" paragraph | `src/app/<tool>/Tool.tsx` | `callout` |
| What a shared link looks like | `src/app/*/opengraph-image.tsx` | `title`, `subtitle` |
| A brand colour | `src/app/globals.css` | the `@theme` block |
| A formula or a rate | `src/lib/finance.ts` | see `FORMULAS.md` first |

`<tool>` is one of `tfsa-universal-life`, `segregated-funds`, or `family-legacy`.

## The legal wording, and the banner across the top

**Every legal string on this site is a placeholder written by a developer. Nobody qualified has reviewed any of it.**

That is why there is a black banner across the top of every page reading "Placeholder legal wording. Not reviewed. Not for publication." It is not a bug. It is there so that unreviewed legal copy cannot quietly end up in front of a client.

### How to fix it

Everything lives in the **`compliance`** object in **`src/config/brand.ts`**. There are four strings and one switch.

| Field | What it covers | State |
| --- | --- | --- |
| `notAdvice` | That this is information, not advice, and does not account for the reader's circumstances. | Placeholder. Generic and conservative, but unreviewed. |
| `illustrationOnly` | That the projections are hypothetical, and that nothing is being offered or sold. | Placeholder. Same. |
| `licensing` | Registration, licensing, and which provinces the advisor may transact in. | **Empty placeholder.** It names no real regulator or licence number, because inventing one would be worse than leaving it blank. You must write this. |
| `privacy` | That nothing is stored or transmitted. | **This one is factually true**, not a guess. The site has no server, no database, and no analytics. Every calculation runs in the browser and the inputs live only in the page address. Do not weaken this claim unless you add tracking, in which case you must rewrite it. |
| `reviewed` | The switch. | `false`. |

**The procedure:** give the four strings to whoever signs off on your marketing, paste back what they give you, then set `reviewed: true`. The banner disappears. Nothing else changes.

Do not set `reviewed: true` to make the banner go away. That is the one thing it exists to prevent.

### The other disclaimers

Separately from the `compliance` block, each tool carries its own disclaimer, in **`disclaimers`** in the same file. Those three are reproduced **word for word from the original HTML files**, so they are the client's existing wording rather than mine. They describe the modelling assumptions for that specific product. They appear in the footer of their own tool page, and they are also worth showing to whoever reviews the rest.

**`generalDisclaimer`**, also in that file, states that the figures are illustrations rather than guarantees. It appears on every tool page and in the site footer.

### Where all of this shows up

- **`src/components/ui/ComplianceBanner.tsx`** renders the black banner, and renders nothing once `reviewed` is `true`.
- **`src/components/ui/SiteFooter.tsx`** lays out the four compliance strings plus `generalDisclaimer` in the footer of every page.
- **`src/components/ui/Disclaimer.tsx`** renders the per-tool disclaimer inside each tool page.

## src/config/brand.ts

Everything about the advisor's identity and every legal disclaimer lives in this one file. If you are rebranding the site, this is the only file you need.

- **`brand.advisor`** is `"Kuntal Shah"`. It appears in the header of every tool page and in the page title.
- **`brand.firm`** is `"Private Wealth Advisory"`. Same places.
- **`brand.tagline`** is the one-line description of the site. It is used as the default meta description.
- **`generalDisclaimer`** appears on every tool page, above that tool's specific disclaimer.
- **`disclaimers`** holds one entry per tool. **These are reproduced word for word from the original HTML files** and should not be paraphrased or tidied up. If your compliance people give you replacement wording, paste it in here and change nothing else.
- **`tools`** is the list that drives the landing page: each tool's URL slug, display name, accent colour, and one-line summary.

## The three tool pages

Each tool is two files. The `page.tsx` is a server component that holds the metadata and the page framing. The `Tool.tsx` is the interactive part.

### page.tsx (one per tool)

Four things you may want to edit:

- **`metadata.title`** and **`metadata.description`**, which is what shows up in a browser tab and in a link preview.
- **`title`**, the big headline at the top of the page.
- **`intro`**, the paragraph under the headline. This is the elevator pitch for that tool, so it is worth reading.
- **`accent`**, which is `ultramarine`, `amber`, or `vermilion`. Changing this recolours the entire page, including the chart.

### Tool.tsx (one per tool)

This file holds every label, every number that appears on screen, and every slider's range. The parts you will want:

**`MODES`** near the top of `tfsa-universal-life` and `family-legacy` sets the tab names. Change `label` to rename a tab. Do not change `value`, because that goes into the URL and any link somebody has already shared will break.

**The `<Slider>` calls** in the JSX. Each one has a `label` (what the user reads), a `display` (the formatted value beside it), and `min` / `max` / `step`. To widen a slider's range, change `min` and `max` here.

**The `useQueryStates` block** at the top sets every slider's starting position. `parseAsInteger.withDefault(500)` means that slider starts at 500. These defaults are what a visitor sees before they touch anything, and they are also what gets used when somebody opens the page with no URL parameters, so pick them to look reasonable.

**`hero`**, **`left`**, **`right`**, and **`cards`** hold the labels and subtitles for the big numbers. Each is assigned once per mode, inside the `if (mode === ...)` branches, so a label can differ between modes.

**`callout`** is the "what this means" paragraph at the bottom. This is the most opinionated writing on the site and the most likely thing you will want to change. It is written as JSX so the numbers can be interpolated live, which is the point of it: the paragraph re-states the client's actual result in words.

### Text unique to one tool

**`segregated-funds/Tool.tsx`** has a **`CONTRACT_TERMS`** array holding the three cards at the bottom of the page: named beneficiary, resetting the floor, and creditor protection. These describe the insurance contract and involve no arithmetic, so you can rewrite them freely. Note the card about probate quotes a range of "1.5% to 5%", which came from the original file. Check it against current Canadian rates before you rely on it.

**`family-legacy/Tool.tsx`** has three lists:
- **`KID_COUNTS`** is the "how many children" dropdown, currently 0 to 4.
- **`AGES`** builds the age dropdown, currently 0 to 17.
- **`BENEFITS`** is the fixed set of monthly benefit amounts a user can choose: $0, $150, $300, $450, $550, $650, $750. These came from the original file. If the government changes the benefit, change this list.
- **`cesgPotential`** encodes the education grant: $500 a year, for at most 15 years. If that programme changes, this is the only place it is written down.

The per-child cards at the bottom of that page, telling you how many years remain before a child turns 18, are written inline in the JSX at the end of the file.

## The landing page

**`src/app/page.tsx`.**

The headline, the three-figure argument beneath it, and the tool cards are all written here.

One thing to know: **the numbers in the hero are computed, not typed.** The page imports the finance engine and works out what a $450 monthly benefit becomes by 18 and by 30, at the rate set in `BENEFIT_RATE` at the top of the file. If you change that rate or that monthly figure, the headline numbers move with it, and they will always agree with what the illustrations themselves produce. Do not replace them with hardcoded text, because then the landing page can start lying while every other page stays honest.

The three cards are generated from the **`tools`** list in `src/config/brand.ts`, so a tool's name, summary, and colour are edited there rather than here.

## What a shared link looks like

**`src/app/opengraph-image.tsx`** and one per tool, in each tool's folder.

These generate the preview card that appears when somebody pastes a link into a message. Each has a `title` and a `subtitle` you can edit freely.

The accent colours in **`src/lib/og.tsx`** are written as literal hex values, because the image generator cannot read the stylesheet. **If you change an accent colour in `globals.css`, change it here too**, or a shared link will not match the page it opens.

## Shared components

These hold small pieces of text that appear on every page, so a change here shows up everywhere.

- **`src/components/ui/ToolShell.tsx`** has the header, which shows the advisor's name, and the "All illustrations" link back to the landing page.
- **`src/components/ui/SiteFooter.tsx`** has the footer that appears on every page, including the compliance wording.
- **`src/components/ui/ComplianceBanner.tsx`** has the "not reviewed" banner.
- **`src/components/ui/Disclaimer.tsx`** has the word "Disclaimer" and the per-tool footer block.
- **`src/components/chart/Ledger.tsx`** has the table: the "Show the year-by-year ledger" toggle and the column headings "Year", "Paid in", "Growth", "Value".
- **`src/components/chart/ProjectionCurve.tsx`** has the chart's own words: the legend defaults ("You paid in" and "Growth"), the axis labels ("Now", "Yr 5", and so on), and the hover tooltip. The two legend labels can be overridden per page by passing `principalLabel` and `growthLabel`.

## Colours and type

**`src/app/globals.css`**, in the `@theme` block.

Six colours matter: `paper` (the background), `ink` (the text), `rule` (hairlines), `principal` (the grey band on every chart, meaning money you paid in), and one accent per tool (`ultramarine`, `amber`, `vermilion`).

**Before you change any colour, read the comments above them.** Two of these values were chosen by a contrast checker, not by eye. `principal` was originally a pale grey that scored 1.27 against the background, which made it almost invisible as a chart fill. `amber` was originally a bright yellow that scored 1.72. Both were darkened until they cleared 3.0, which is the minimum for something a person has to be able to see. If you brighten them back up, the charts stop being readable and you will not necessarily notice on your own monitor.

Type is set in **`src/app/layout.tsx`**: Archivo for headlines and big numbers, Instrument Sans for body text, IBM Plex Mono for the ledger.

## Numbers that are hardcoded in the math

These live in `src/lib/finance.ts` and each one is explained properly in `FORMULAS.md`. Listed here so you know they exist.

| Value | What it is |
| --- | --- |
| `0.005` and `0.0003` | The Universal Life insurance charge: half a percent a year, plus 0.03 more for every year past 25 that the client was when they signed. |
| `JUVENILE_COI_DRAG = 0.001` | The same charge for a policy written on a child, which is far cheaper. |
| `0.01` | The lowest rate a Universal Life policy is allowed to fall to, however heavy the charge. |
| `0.004` | What the 100% segregated fund guarantee costs you in annual return. |
| `18` | The age the Canada Child Benefit stops. Written in `ccbStream`. |
| `MIN_TARGET_HORIZON_YEARS = 5` | A reverse-target plan cannot be shorter than this, because the solver divides by zero at a zero horizon. |

## A warning about the original files

`reference/html_files/` holds the six original pages this site replaces. They are kept as the specification, and they are useful.

**Do not use the numbers printed in them to check your work.** Several are stale. `3.html` displays $141,586 when its own code computes $151,012, and `4.html` displays $158,340 when its own code computes $167,196. Somebody hardcoded those figures into the markup and never regenerated them after the formulas changed. The originals overwrite them with the correct values the moment you move a slider.

If you need to verify a number, run `npm test`. The test suite pins every figure against values produced by running the original files' own functions.
