"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the global site chrome (compliance banner, footer) on the login screen so
 * it can present as a clean, self-contained sign-in page. The children are server
 * components passed through as props, so they stay server-rendered — this gate
 * only decides whether they appear.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return <>{children}</>;
}
