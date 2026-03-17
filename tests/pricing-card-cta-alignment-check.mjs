import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/ui/pricing-card.tsx", import.meta.url),
  "utf8",
);

if (!source.includes('<ul className="mt-8 space-y-3 text-sm text-slate-700">')) {
  console.error("Expected pricing features list markup to exist.");
  process.exit(1);
}

if (!source.includes('<div className="mt-auto pt-8">')) {
  console.error("Expected pricing CTA wrapper to pin buttons to the bottom of each card.");
  process.exit(1);
}

console.log("Verified pricing card CTA wrappers are bottom-aligned.");
