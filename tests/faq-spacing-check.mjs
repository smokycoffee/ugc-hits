import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/landing/faq-section.tsx", import.meta.url),
  "utf8",
);

if (!source.includes('className="mt-10 space-y-0.5"')) {
  console.error("Expected FAQ items to use a 2px vertical gap.");
  process.exit(1);
}

console.log("Verified FAQ items use a 2px vertical gap.");
