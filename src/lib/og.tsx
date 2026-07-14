import { ImageResponse } from "next/og";
import { brand, type Accent } from "@/config/brand";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Satori cannot read CSS custom properties, so the OG cards need literal hexes.
 * These must match the @theme block in globals.css. If you change a colour there
 * and not here, the shared link stops matching the page it links to.
 */
const ACCENT_HEX: Record<Accent, string> = {
  ultramarine: "#1F35FF",
  amber: "#C08000",
  vermilion: "#FF3B14",
};

const PAPER = "#FBFBF9";
const INK = "#0A0A0A";
const MUTED = "#6B6862";

export function ogImage({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent?: Accent;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {accent ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 16,
              background: ACCENT_HEX[accent],
              marginBottom: 56,
            }}
          />
        ) : (
          <div style={{ display: "flex", height: 16, marginBottom: 56 }} />
        )}

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {brand.advisor} / {brand.firm}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginTop: 28,
            maxWidth: 940,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            lineHeight: 1.4,
            color: MUTED,
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          Illustration, not a guarantee
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
