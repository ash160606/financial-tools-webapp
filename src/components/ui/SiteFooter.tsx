import { brand, compliance, generalDisclaimer } from "@/config/brand";

/** The legal layer that sits under every route, tool pages included. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="display text-lg">
            {brand.advisor}
            <span className="text-muted"> / {brand.firm}</span>
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
            Illustrations, not guarantees
          </p>
        </div>

        <div className="mt-8 grid gap-8 border-t border-rule pt-8 text-xs leading-relaxed text-muted md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono uppercase tracking-[0.15em] text-ink">
                Not advice
              </p>
              <p className="mt-1.5">{compliance.notAdvice}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.15em] text-ink">
                Illustration only
              </p>
              <p className="mt-1.5">{compliance.illustrationOnly}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono uppercase tracking-[0.15em] text-ink">
                Assumptions
              </p>
              <p className="mt-1.5">{generalDisclaimer}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.15em] text-ink">
                Licensing
              </p>
              <p className="mt-1.5">{compliance.licensing}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.15em] text-ink">
                Your data
              </p>
              <p className="mt-1.5">{compliance.privacy}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
