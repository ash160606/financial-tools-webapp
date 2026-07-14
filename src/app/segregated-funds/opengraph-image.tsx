import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Segregated Funds";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Segregated Funds",
    subtitle: "A guaranteed floor under your capital, and what you pay in growth to get it.",
    accent: "amber",
  });
}
