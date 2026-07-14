import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolShell } from "@/components/ui/ToolShell";
import { disclaimers } from "@/config/brand";
import { SegregatedFundsTool } from "./Tool";

export const metadata: Metadata = {
  title: "Option 2 : Segregated Funds",
  description:
    "Reinvest the Canada Child Benefit into an insurance contract with a guaranteed capital floor and a probate bypass.",
};

export default function Page() {
  return (
    <ToolShell
      accent="amber"
      title="Segregated Funds"
      intro="A segregated fund is a mutual fund wrapped in an insurance contract. The contract guarantees a share of every dollar you deposit, whatever the market does. The stronger guarantee costs you growth. This shows you both sides of that trade at once."
      disclaimer={disclaimers.segregatedFunds}
    >
      <Suspense>
        <SegregatedFundsTool />
      </Suspense>
    </ToolShell>
  );
}
