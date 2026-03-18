import { existsSync, readFileSync } from "node:fs";

const navbarSource = readFileSync(
  new URL("../src/components/ui/navbar-menu.tsx", import.meta.url),
  "utf8",
);

if (!navbarSource.includes("Get Started")) {
  console.error("Expected navbar to include a Get Started CTA.");
  process.exit(1);
}

const routePath = new URL(
  "../src/app/[locale]/get-started/page.tsx",
  import.meta.url,
);

if (!existsSync(routePath)) {
  console.error("Expected localized get-started route to exist.");
  process.exit(1);
}

const enMessagesSource = readFileSync(
  new URL("../messages/en.json", import.meta.url),
  "utf8",
);

if (enMessagesSource.includes("Start with the flow that matches how you use UGC Hits.")) {
  console.error("Expected the old get-started intro copy to be removed.");
  process.exit(1);
}

if (!enMessagesSource.includes("Apply for brand access")) {
  console.error("Expected English get-started copy to include the brand access CTA.");
  process.exit(1);
}

if (
  !enMessagesSource.includes('"headlineLead": "Join an invite-only"') ||
  !enMessagesSource.includes('"headlineAccent": "creator network."')
) {
  console.error("Expected English get-started copy to include the split creator headline.");
  process.exit(1);
}

const routeSource = readFileSync(routePath, "utf8");

if (!routeSource.includes("GetStartedShell")) {
  console.error("Expected get-started route to render the get-started shell.");
  process.exit(1);
}

console.log("Verified navbar CTA and simplified get-started copy.");
