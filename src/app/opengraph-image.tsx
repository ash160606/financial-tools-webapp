import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Financial Illustrations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Money you already receive.",
    subtitle: "Three illustrations of Canadian tax-sheltered and insurance-wrapped wealth strategies.",
  });
}
