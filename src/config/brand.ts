/**
 * Advisor identity and compliance copy, in one place.
 *
 * The disclaimers are reproduced verbatim from the source files in
 * reference/html_files — they are the compliance surface of a financial
 * illustration and must not be paraphrased.
 */

export const brand = {
  advisor: "Kuntal Shah",
  firm: "Private Wealth Advisory",
  tagline:
    "Interactive illustrations for Canadian tax-sheltered and insurance-wrapped wealth strategies.",
} as const;

/** Applies to every illustration on the site. */
export const generalDisclaimer =
  "All figures are illustrations, not guarantees. Projections assume a constant rate of return compounded monthly with no withdrawals, fees, or tax events beyond those stated. Actual results will vary.";

/**
 * Site-wide legal wording.
 *
 * EVERY STRING BELOW IS A PLACEHOLDER. It is written to be conservative and
 * plausible, but nobody qualified has reviewed it, and it names no real
 * regulator, licence, or registration because inventing those would be worse
 * than saying nothing.
 *
 * `reviewed` gates a visible banner across the top of every page. While it is
 * false, the site says out loud that its legal copy is unreviewed. Flip it to
 * true only once someone qualified has actually replaced the strings below.
 */
export const compliance = {
  reviewed: false,

  notAdvice:
    "This site provides general information only. It is not financial, tax, insurance, or legal advice, and it does not account for your personal circumstances. Speak to a licensed advisor before acting on anything you see here.",

  illustrationOnly:
    "The projections shown are hypothetical illustrations generated from the assumptions you enter. They are not offers, quotes, or predictions. No product shown here has been recommended to you, and no product is being sold to you through this site.",

  licensing:
    "Insurance products are distributed through licensed representatives. Registration and licensing details go here, along with the jurisdictions in which the advisor is permitted to transact.",

  privacy:
    "This site stores nothing. Every calculation runs in your browser, and the values you enter are held only in the page address so that you can share or bookmark an illustration. Nothing is transmitted to a server, and no analytics or tracking is in place.",
} as const;

/** Per-tool, verbatim from the originating file. */
export const disclaimers = {
  // reference/html_files/3.html
  tfsaUniversalLife:
    "Values are structured using standard compounded interest formulas calculated monthly. Real-world Universal Life (UL) policy values reflect specific premium distributions, underwriting medical files, and administrative cost patterns. Universal Life calculations build in a standard entry-age-relative drag metric representing locked insurance fees.",

  // reference/html_files/4.html
  segregatedFunds:
    "Calculations assume monthly compounded investment growth. Returns inside Segregated Funds reflect net returns after Management Expense Ratio (MER) adjustments, which carry a tiny insurance cost premium (typically 0.2% - 0.5% higher than mutual funds) in exchange for the contract safety guarantees. Maturity guarantees typically vest on a 10-year lock-in cycle.",

  // reference/html_files/6.html
  familyLegacy:
    "Calculated values build on compounding interest formulas applied monthly. Universal Life (UL), Registered Plans (TFSA/RRSP/RESP), and Segregated Fund outcomes depend on premium distribution patterns, insurance expense ratios, and asset class selections. All calculations assume normal compounding with zero withdrawal friction.",
} as const;

export type Accent = "ultramarine" | "amber" | "vermilion";

export const tools = [
  {
    slug: "tfsa-universal-life",
    name: "Option 1 : TFSA + Universal Life",
    accent: "ultramarine",
    summary:
      "Project a combined TFSA and Universal Life position, solve backwards from a target, or shelter a child benefit.",
    disclaimer: disclaimers.tfsaUniversalLife,
  },
  {
    slug: "segregated-funds",
    name: "Option 2 : Segregated Funds",
    accent: "amber",
    summary:
      "Reinvest the Canada Child Benefit into an insurance contract with a guaranteed capital floor and probate bypass.",
    disclaimer: disclaimers.segregatedFunds,
  },
  {
    slug: "family-legacy",
    name: "Option 3 : Family & Legacy",
    accent: "vermilion",
    summary:
      "Coordinate two spouses and up to four children, with each child's benefit reinvested until they turn 18.",
    disclaimer: disclaimers.familyLegacy,
  },
] as const satisfies ReadonlyArray<{
  slug: string;
  name: string;
  accent: Accent;
  summary: string;
  disclaimer: string;
}>;
