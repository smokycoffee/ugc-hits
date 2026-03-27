import { readFileSync } from "node:fs";

const pricingCardSource = readFileSync(
  new URL("../src/components/ui/pricing-card.tsx", import.meta.url),
  "utf8",
);
const pricingSectionSource = readFileSync(
  new URL("../src/components/landing/pricing-section.tsx", import.meta.url),
  "utf8",
);
const landingContentSource = readFileSync(
  new URL("../src/lib/get-landing-content.ts", import.meta.url),
  "utf8",
);

if (!landingContentSource.includes("href?: string;")) {
  console.error("Expected pricing plan data to support an optional href.");
  process.exit(1);
}

if (!landingContentSource.includes("href: index === 0 ? getStartedHref : undefined,")) {
  console.error("Expected the first pricing plan to route to the localized get-started page.");
  process.exit(1);
}

if (!pricingSectionSource.includes("href={plan.href}")) {
  console.error("Expected pricing section to forward plan href values to pricing cards.");
  process.exit(1);
}

if (!pricingCardSource.includes("import Link from \"next/link\";")) {
  console.error("Expected pricing card CTAs to use Next.js links for navigation.");
  process.exit(1);
}

if (!pricingCardSource.includes("href?: string;")) {
  console.error("Expected pricing card props to accept an optional href.");
  process.exit(1);
}

if (!pricingCardSource.includes("<Link") || !pricingCardSource.includes("href={href}")) {
  console.error("Expected pricing card to render a link CTA when an href is provided.");
  process.exit(1);
}

console.log("Verified self-serve pricing card routes to the localized get-started page.");
