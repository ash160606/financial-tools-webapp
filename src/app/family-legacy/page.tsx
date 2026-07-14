import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolShell } from "@/components/ui/ToolShell";
import { disclaimers } from "@/config/brand";
import { FamilyLegacyTool } from "./Tool";

export const metadata: Metadata = {
  title: "Option 3 : Family & Legacy",
  description:
    "Coordinate two spouses and up to four children, with each child's benefit reinvested until they turn 18.",
};

export default function Page() {
  return (
    <ToolShell
      accent="vermilion"
      title="Family & Legacy"
      intro="Two people saving, and a child benefit that arrives every month until each child turns 18. Reinvest the benefit instead of spending it and it carries a surprising share of the whole plan."
      disclaimer={disclaimers.familyLegacy}
    >
      <Suspense>
        <FamilyLegacyTool />
      </Suspense>
    </ToolShell>
  );
}
