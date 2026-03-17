import { readFileSync } from "node:fs";

const configSource = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");

const hasRootRedirect =
  configSource.includes("async redirects()") &&
  configSource.includes('source: "/"') &&
  configSource.includes('destination: "/pl"');

if (!hasRootRedirect) {
  console.error("Expected next.config.ts to redirect / to /pl.");
  process.exit(1);
}

console.log("Verified root redirect from / to /pl.");
