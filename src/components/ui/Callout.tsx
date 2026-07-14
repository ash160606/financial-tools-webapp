import { cn } from "@/lib/cn";

type CalloutProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

/** The "what this actually means" panel. One per tool, never more. */
export function Callout({ title, children, className }: CalloutProps) {
  return (
    <aside className={cn("border-l-4 border-l-accent bg-ink/[0.03] p-5", className)}>
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed [&_strong]:font-semibold">
        {children}
      </div>
    </aside>
  );
}
