import { compliance } from "@/config/brand";

/**
 * Renders while `compliance.reviewed` is false, which it is until somebody
 * qualified has replaced the placeholder legal wording in src/config/brand.ts.
 *
 * This is deliberately impossible to miss. Placeholder legal copy on a live
 * financial site is the kind of thing that gets noticed by the wrong person
 * first, so the site says it out loud rather than hoping someone remembers.
 */
export function ComplianceBanner() {
  if (compliance.reviewed) return null;

  return (
    <div className="border-b-2 border-ink bg-ink text-paper">
      <p className="mx-auto w-full max-w-6xl px-6 py-2 font-mono text-xs uppercase tracking-[0.15em]">
        Disclaimer : All information shown is for illustration and educational
        purposes
      </p>
    </div>
  );
}
