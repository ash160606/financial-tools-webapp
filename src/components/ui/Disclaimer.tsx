import { generalDisclaimer } from "@/config/brand";

/**
 * These are financial illustrations, so the disclaimer is not decoration. The
 * per-tool text is reproduced verbatim from the source file it came from.
 */
export function Disclaimer({ text }: { text: string }) {
  return (
    <div className="border-t border-rule pt-6 text-xs leading-relaxed text-muted">
      <p className="font-mono uppercase tracking-[0.15em]">Disclaimer</p>
      <p className="mt-2 max-w-3xl">{generalDisclaimer}</p>
      <p className="mt-2 max-w-3xl">{text}</p>
    </div>
  );
}
