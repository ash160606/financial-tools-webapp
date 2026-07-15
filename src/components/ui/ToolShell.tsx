import Link from "next/link";
import { brand, type Accent } from "@/config/brand";
import { Disclaimer } from "./Disclaimer";
import { ThemeToggle } from "./ThemeToggle";

type ToolShellProps = {
  /** Sets --accent for everything below. Slider fills, curve, rules all follow. */
  accent: Accent;
  title: string;
  intro: string;
  disclaimer: string;
  children: React.ReactNode;
};

export function ToolShell({
  accent,
  title,
  intro,
  disclaimer,
  children,
}: ToolShellProps) {
  return (
    <div data-accent={accent} className="flex min-h-full flex-col">
      <header className="border-b border-ink">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em]">
            {brand.advisor}
            <span className="text-muted"> / {brand.firm}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm underline underline-offset-4">
              All illustrations
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="display text-4xl leading-[1.05] md:text-5xl">{title}</h1>
          <p className="mt-4 text-lg text-muted">{intro}</p>
        </div>

        <div className="mt-10 md:mt-14">{children}</div>

        <footer className="mt-16">
          <Disclaimer text={disclaimer} />
        </footer>
      </main>
    </div>
  );
}
