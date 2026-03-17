import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/ui/navbar-menu.tsx", import.meta.url),
  "utf8",
);

if (!source.includes('className="flex items-center gap-3"')) {
  console.error("Expected navbar controls wrapper to exist.");
  process.exit(1);
}

if (!source.includes('aria-label="Select language"')) {
  console.error("Expected navbar to include a language switcher.");
  process.exit(1);
}

if (!source.includes("md:hidden")) {
  console.error("Expected a mobile-only navbar control block.");
  process.exit(1);
}

if (!source.includes("Post Campaign")) {
  console.error("Expected a shorter mobile CTA label.");
  process.exit(1);
}

console.log("Verified mobile navbar locale switcher and CTA label.");
