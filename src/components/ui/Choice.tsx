"use client";

import { cn } from "@/lib/cn";

export type ChoiceOption<T extends string | number> = {
  value: T;
  label: string;
  hint?: string;
};

type ChoiceProps<T extends string | number> = {
  label: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

/**
 * A segmented radio group. This is a choice between settings, not navigation
 * between views, so it carries radio semantics rather than tab semantics.
 */
export function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: ChoiceProps<T>) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-medium">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-2 border border-ink"
      >
        {options.map((o, i) => {
          const selected = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "px-4 py-3 text-left transition-colors duration-100",
                i > 0 && "border-l border-ink",
                selected ? "bg-ink text-paper" : "hover:bg-ink/5",
              )}
            >
              <span className="block text-sm font-semibold">{o.label}</span>
              {o.hint ? (
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    selected ? "text-paper/70" : "text-muted",
                  )}
                >
                  {o.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
