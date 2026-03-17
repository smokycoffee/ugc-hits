import { readFileSync } from "node:fs";

const cases = [
  ["process", new URL("../src/components/landing/process-section.tsx", import.meta.url)],
  ["pricing", new URL("../src/components/landing/pricing-section.tsx", import.meta.url)],
  ["proof", new URL("../src/components/landing/why-section.tsx", import.meta.url)],
  ["faq", new URL("../src/components/landing/faq-section.tsx", import.meta.url)],
];

for (const [label, fileUrl] of cases) {
  const source = readFileSync(fileUrl, "utf8");

  if (!source.includes("scroll-mt-28") || !source.includes("md:scroll-mt-32")) {
    console.error(`Expected ${label} section to include navbar anchor offset classes.`);
    process.exit(1);
  }
}

console.log("Verified main navbar sections include anchor offset classes.");
