import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Family & Legacy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Family & Legacy",
    subtitle: "Two spouses, four children, and a benefit that stops the day each one turns 18.",
    accent: "vermilion",
  });
}
