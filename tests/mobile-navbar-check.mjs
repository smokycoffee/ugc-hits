import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/ui/navbar-menu.tsx", import.meta.url),
  "utf8",
);

if (!source.startsWith('"use client";')) {
  console.error("Expected navbar-menu to be a client component for mobile toggle state.");
  process.exit(1);
}

if (!source.includes("aria-expanded={isMobileMenuOpen}")) {
  console.error("Expected navbar-menu to expose an accessible burger toggle state.");
  process.exit(1);
}

if (!source.includes('id="mobile-primary-navigation"')) {
  console.error(
    "Expected navbar-menu to expose a controlled mobile navigation panel.",
  );
  process.exit(1);
}

if (!source.includes('!isMobileMenuOpen && "hidden"')) {
  console.error("Expected mobile navigation links to stay hidden until the burger opens.");
  process.exit(1);
}

const languageSwitcherMatches = source.match(/aria-label="Select language"/g) ?? [];

if (languageSwitcherMatches.length < 2) {
  console.error("Expected separate desktop and mobile language switchers.");
  process.exit(1);
}

if (!source.includes("md:hidden")) {
  console.error("Expected a mobile-only header control row.");
  process.exit(1);
}

if (!source.includes('aria-label="Mobile primary"')) {
  console.error("Expected a dedicated mobile primary navigation panel.");
  process.exit(1);
}

if (!source.includes("grid gap-2 rounded-[22px]")) {
  console.error("Expected the expanded mobile menu to use the refined dropdown-card layout.");
  process.exit(1);
}

if (!source.includes("Post Campaign")) {
  console.error("Expected a shorter mobile CTA label for the compact navbar layout.");
  process.exit(1);
}

console.log("Verified navbar-menu includes mobile-visible navigation controls.");
