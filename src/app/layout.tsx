import type { Metadata } from "next";
import { Archivo, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { brand } from "@/config/brand";
import { ComplianceBanner } from "@/components/ui/ComplianceBanner";
import { SiteFooter } from "@/components/ui/SiteFooter";
import "./globals.css";

// Display: Archivo's variable width axis lets us reach the expanded, poster
// weight used for headlines and hero figures. See .display in globals.css.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

// Ledger figures — tabular by design, for the year-by-year rows.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/**
 * Open Graph image URLs must be absolute, so Next needs to know where the site
 * lives. On Vercel this resolves itself. Set NEXT_PUBLIC_SITE_URL once there is
 * a custom domain, or shared links will point at the preview deployment.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.firm} — Financial Illustrations`,
    template: `%s — ${brand.firm}`,
  },
  description: brand.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrumentSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ComplianceBanner />
        <NuqsAdapter>{children}</NuqsAdapter>
        <SiteFooter />
      </body>
    </html>
  );
}
