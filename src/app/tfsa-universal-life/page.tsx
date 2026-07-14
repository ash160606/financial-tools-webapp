import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolShell } from "@/components/ui/ToolShell";
import { disclaimers } from "@/config/brand";
import { TfsaUniversalLifeTool } from "./Tool";

export const metadata: Metadata = {
  title: "TFSA + Universal Life",
  description:
    "Project a combined TFSA and Universal Life position, solve backwards from a target, or shelter a child benefit.",
};

export default function Page() {
  return (
    <ToolShell
      accent="ultramarine"
      title="TFSA + Universal Life"
      intro="A TFSA compounds at the market rate. A Universal Life policy compounds more slowly, because part of every premium buys the insurance. Hold both and you can see exactly what that costs, and what it buys."
      disclaimer={disclaimers.tfsaUniversalLife}
    >
      <Suspense>
        <TfsaUniversalLifeTool />
      </Suspense>
    </ToolShell>
  );
}
