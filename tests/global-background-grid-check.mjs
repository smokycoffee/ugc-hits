import { readFileSync } from "node:fs";

const globalsSource = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);
const heroSource = readFileSync(
  new URL("../src/components/landing/hero-section.tsx", import.meta.url),
  "utf8",
);
const getStartedSource = readFileSync(
  new URL("../src/components/landing/get-started-shell.tsx", import.meta.url),
  "utf8",
);

if (!globalsSource.includes("linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px)")) {
  console.error("Expected globals.css body background to include the subtle grid layer.");
  process.exit(1);
}

if (!globalsSource.includes("radial-gradient(circle at top left, rgba(45, 212, 191, 0.14), transparent 32%)")) {
  console.error("Expected globals.css body background to include the shared top-left glow.");
  process.exit(1);
}

if (!globalsSource.includes("radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 30%)")) {
  console.error("Expected globals.css body background to include the shared top-right glow.");
  process.exit(1);
}

if (heroSource.includes("bg-[size:56px_56px]")) {
  console.error("Expected hero section to stop rendering its own grid overlay.");
  process.exit(1);
}

if (getStartedSource.includes("bg-[size:56px_56px]")) {
  console.error("Expected get-started shell to stop rendering its own grid overlay.");
  process.exit(1);
}

if (heroSource.includes("radial-gradient(circle_at_top_left")) {
  console.error("Expected hero section to stop rendering its own glow layer.");
  process.exit(1);
}

if (getStartedSource.includes("radial-gradient(circle_at_top_left")) {
  console.error("Expected get-started shell to stop rendering its own glow layer.");
  process.exit(1);
}

console.log("Verified global background grid and removed local duplicate overlays.");
