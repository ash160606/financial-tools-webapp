"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";

type SliderProps = {
  label: string;
  /** Formatted for display: "$450", "7.5%", "20 years". */
  display: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
};

/**
 * The thumb reads as a marker on a ruler, which is the instrument this whole
 * site imitates. Radix gives us the thing the source files never had: a slider
 * that works outside Chrome and responds to arrow keys, Home, End, and PageUp.
 */
export function Slider({
  label,
  display,
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: SliderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm font-medium">{label}</label>
        <output className="display tabular text-lg">{display}</output>
      </div>

      <RadixSlider.Root
        className="relative flex h-7 w-full touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      >
        <RadixSlider.Track className="relative h-1 w-full grow bg-rule">
          <RadixSlider.Range className="absolute h-full bg-accent" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block h-7 w-2.5 bg-ink",
            "transition-transform duration-100 hover:scale-y-110",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          )}
        />
      </RadixSlider.Root>
    </div>
  );
}
