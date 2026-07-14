import Link from "next/link";
import { brand, tools } from "@/config/brand";
import { ccbFutureValue } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

/**
 * The thesis, computed rather than asserted: a $450 monthly child benefit,
 * reinvested from birth to 18 and then left alone until 30, without anyone
 * contributing a dollar of their own.
 */
const BENEFIT_MONTHLY = 450;
const BENEFIT_RATE = 0.075;
const benefitAt18 = ccbFutureValue(0, BENEFIT_MONTHLY, BENEFIT_RATE, 18 * 12);
const benefitAt30 = ccbFutureValue(0, BENEFIT_MONTHLY, BENEFIT_RATE, 30 * 12);
const benefitPaidIn = BENEFIT_MONTHLY * 18 * 12;

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-ink">
        <div className="mx-auto w-full max-w-6xl px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.15em]">
            {brand.advisor}
            <span className="text-muted"> / {brand.firm}</span>
          </p>
        </div>
      </header>

      {/* The pitch. Every tool on this site is a variation of one idea, so the
          landing page states the idea rather than describing the tools. */}
      <section className="border-b border-ink">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="display text-5xl leading-[0.95] md:text-7xl">
              Money you
              <br />
              already
              <br />
              receive.
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
              The Canada Child Benefit arrives every month until your child
              turns 18. Most families spend it. Reinvested instead, and then
              left alone, it does this:
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <dl className="flex flex-col gap-6">
              <div className="border-l-4 border-l-ink pl-5">
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  The government pays you
                </dt>
                <dd className="display tabular mt-1 text-3xl">
                  {formatCurrency(benefitPaidIn)}
                </dd>
                <p className="mt-1 text-sm text-muted">
                  {formatCurrency(BENEFIT_MONTHLY)} a month, birth to 18
                </p>
              </div>

              <div className="border-l-4 border-l-ink pl-5">
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Worth at 18
                </dt>
                <dd className="display tabular mt-1 text-3xl">
                  {formatCurrency(benefitAt18)}
                </dd>
              </div>

              <div
                data-accent="vermilion"
                className="border-l-4 border-l-accent pl-5"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  Left untouched, worth at 30
                </dt>
                <dd className="display tabular mt-1 text-5xl">
                  {formatCurrency(benefitAt30)}
                </dd>
                <p className="mt-1 text-sm text-muted">
                  You never earned it and you never contributed it
                </p>
              </div>
            </dl>

            <p className="mt-6 font-mono text-xs leading-relaxed text-muted">
              Assumes {(BENEFIT_RATE * 100).toFixed(1)}% compounded monthly.
              Change the assumptions in any illustration below.
            </p>
          </div>
        </div>
      </section>

      {/* The tools */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Three illustrations
        </h2>

        <div className="mt-8 grid gap-px border border-ink bg-ink md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              data-accent={tool.accent}
              className="group flex flex-col bg-paper p-6 transition-colors duration-100 hover:bg-ink/3"
            >
              <span className="h-2 w-full bg-accent" />
              <h3 className="display mt-6 text-2xl leading-tight">
                {tool.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {tool.summary}
              </p>
              <span className="mt-6 font-mono text-xs uppercase tracking-[0.15em] underline underline-offset-4 group-hover:no-underline">
                Open the illustration
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
          Every illustration runs in your browser and puts its settings in the
          page address, so you can configure one and send the link. The person
          who opens it sees exactly the numbers you saw.
        </p>
      </section>
    </main>
  );
}
