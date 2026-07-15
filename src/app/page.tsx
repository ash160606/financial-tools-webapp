import Image from "next/image";
import Link from "next/link";
import { brand, tools } from "@/config/brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-ink">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.15em]">
            {brand.advisor}
            <span className="text-muted"> / {brand.firm}</span>
          </p>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero. A circular portrait, the advisor's name in the poster face, and
          a one-line statement of what the firm does. */}
      <section className="border-b border-ink">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-6 py-16 md:flex-row md:items-center md:gap-14 md:py-24">
          <Image
            src="/kuntal.jpeg"
            alt={`Portrait of ${brand.advisor}`}
            width={280}
            height={280}
            priority
            className="aspect-square w-40 shrink-0 rounded-full border border-ink object-cover object-[center_15%] md:w-64"
          />

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {brand.firm}
            </p>
            <h1 className="display mt-3 text-5xl leading-[0.95] md:text-7xl">
              {brand.advisor}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {brand.tagline}
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
              className="group flex flex-col bg-paper p-6 transition-colors duration-100 hover:bg-mint"
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
