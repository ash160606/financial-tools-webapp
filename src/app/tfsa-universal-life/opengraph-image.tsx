import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "TFSA + Universal Life";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "TFSA + Universal Life",
    subtitle: "What the insurance charge costs you, and what it buys.",
    accent: "ultramarine",
  });
}
