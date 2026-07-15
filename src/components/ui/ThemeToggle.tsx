"use client";

import { useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

/** The theme in force: an explicit choice on <html> wins, else we mirror the OS. */
function readTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Re-read the theme whenever the OS preference flips or we mutate data-theme.
 * useSyncExternalStore keeps the button label/icon in sync without a hydration
 * mismatch: SSR uses the server snapshot, the client re-reads after mount.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => {
    media.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/**
 * Appearance toggle. Flips the theme for the current session by stamping a
 * data-theme attribute on <html> that the CSS honors — nothing is persisted, so
 * a reload returns to the OS setting (the site "stores nothing"). The icon does
 * a half-turn on each click; reduced-motion neutralizes it via globals.css.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light");
  const [turns, setTurns] = useState(0);

  function toggle() {
    document.documentElement.dataset.theme = theme === "dark" ? "light" : "dark";
    setTurns((t) => t + 1);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className={cn(
        "grid size-9 place-items-center border border-ink text-ink",
        "transition-colors duration-100 hover:bg-ink/5",
        className,
      )}
    >
      <span
        className="block transition-transform duration-300 ease-out"
        style={{ transform: `rotate(${turns * 180}deg)` }}
      >
        {theme === "dark" ? (
          <Sun size={16} strokeWidth={1.75} />
        ) : (
          <Moon size={16} strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
