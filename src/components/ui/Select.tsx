"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "@/lib/cn";

export type Option = { value: string; label: string };

type SelectProps = {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  /** Hide the visible label but keep it for screen readers. */
  hideLabel?: boolean;
  className?: string;
};

export function Select({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
  className,
}: SelectProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {hideLabel ? null : <span className="text-sm font-medium">{label}</span>}

      <RadixSelect.Root value={value} onValueChange={onChange}>
        <RadixSelect.Trigger
          aria-label={label}
          className={cn(
            "flex items-center gap-2 border border-ink px-3 py-1.5",
            "font-mono text-sm tabular-nums",
            "hover:bg-ink/5 transition-colors duration-100",
          )}
        >
          <RadixSelect.Value />
          <RadixSelect.Icon aria-hidden>▾</RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 border border-ink bg-paper shadow-[4px_4px_0_0_var(--color-ink)]"
          >
            <RadixSelect.Viewport className="max-h-64 p-1">
              {options.map((o) => (
                <RadixSelect.Item
                  key={o.value}
                  value={o.value}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 font-mono text-sm tabular-nums outline-none",
                    "data-[highlighted]:bg-ink data-[highlighted]:text-paper",
                    "data-[state=checked]:font-semibold",
                  )}
                >
                  <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
