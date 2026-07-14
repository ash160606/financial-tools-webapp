"use client";

import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Eases an array of numbers toward a target.
 *
 * The curve resamples to a fixed point count, so `target` always has the same
 * length and the values can simply be interpolated element-wise. That is what
 * lets the chart morph when you switch modes instead of snapping.
 *
 * Dragging a slider produces a continuous stream of targets, which this chases
 * closely enough to read as direct manipulation rather than as animation.
 */
export function useTweenedArray(target: number[], duration = 260): number[] {
  const [current, setCurrent] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion() || fromRef.current.length !== target.length) {
      fromRef.current = target;
      setCurrent(target);
      return;
    }

    const from = fromRef.current;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = easeOutCubic(t);
      const next = target.map((to, i) => from[i] + (to - from[i]) * eased);

      fromRef.current = next;
      setCurrent(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(target), duration]);

  return current;
}
