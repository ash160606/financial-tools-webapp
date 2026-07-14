"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export type Mode = { value: string; label: string };

type ModeTabsProps = {
  modes: readonly Mode[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * Selected tab inverts to solid ink. No pill, no shadow, no active-state glow:
 * the contrast does the work.
 */
export function ModeTabs({ modes, value, onChange, className }: ModeTabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onChange} className={className}>
      <RadixTabs.List
        className={cn(
          "grid w-full border border-ink",
          modes.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {modes.map((mode, i) => (
          <RadixTabs.Trigger
            key={mode.value}
            value={mode.value}
            className={cn(
              "px-4 py-3 text-sm font-medium",
              "border-ink not-last:border-b sm:not-last:border-b-0 sm:not-last:border-r",
              "transition-colors duration-100",
              "hover:bg-ink/5",
              "data-[state=active]:bg-ink data-[state=active]:text-paper",
              "data-[state=active]:hover:bg-ink",
            )}
            // Tabs read left to right; give the reader the order.
            aria-posinset={i + 1}
            aria-setsize={modes.length}
          >
            {mode.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}
