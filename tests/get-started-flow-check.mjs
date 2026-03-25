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
const onboardingRoutePath = new URL(
  "../src/app/[locale]/onboarding-brand/page.tsx",
  import.meta.url,
);

if (!existsSync(routePath)) {
  console.error("Expected localized get-started route to exist.");
  process.exit(1);
}

if (!existsSync(onboardingRoutePath)) {
  console.error("Expected localized onboarding-brand route to exist.");
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
const onboardingRouteSource = readFileSync(onboardingRoutePath, "utf8");
const getStartedShellSource = readFileSync(
  new URL("../src/components/landing/get-started-shell.tsx", import.meta.url),
  "utf8",
);
const onboardingShellSource = readFileSync(
  new URL("../src/components/onboarding/brand-onboarding-shell.tsx", import.meta.url),
  "utf8",
);
const localeChromeSource = readFileSync(
  new URL("../src/components/landing/page-locale-chrome.tsx", import.meta.url),
  "utf8",
);
const platformUtilsSource = readFileSync(
  new URL("../src/lib/platform/utils.ts", import.meta.url),
  "utf8",
);

if (!routeSource.includes("GetStartedShell")) {
  console.error("Expected get-started route to render the get-started shell.");
  process.exit(1);
}

if (routeSource.includes("SiteHeader") || onboardingRouteSource.includes("SiteHeader")) {
  console.error("Expected get-started and onboarding-brand routes to hide the shared navbar.");
  process.exit(1);
}

if (!getStartedShellSource.includes("buildBrandLoginPath")) {
  console.error("Expected get-started shell to navigate to login first.");
  process.exit(1);
}

if (
  !getStartedShellSource.includes("companyName") ||
  !getStartedShellSource.includes("productType")
) {
  console.error("Expected get-started shell to capture companyName and productType.");
  process.exit(1);
}

if (
  getStartedShellSource.includes('field.label === "Company name"') ||
  getStartedShellSource.includes('field.label === "Product type"')
) {
  console.error("Expected get-started shell field wiring to avoid English-only label matching.");
  process.exit(1);
}

if (
  !platformUtilsSource.includes('return `/${locale}${path}`;') ||
  !localeChromeSource.includes('return `/${locale}${path}`;')
) {
  console.error("Expected locale path helpers to always preserve the explicit locale segment.");
  process.exit(1);
}

if (!getStartedShellSource.includes("router.push")) {
  console.error("Expected get-started shell to push login query params.");
  process.exit(1);
}

const loginRouteSource = readFileSync(
  new URL("../src/app/[locale]/login/page.tsx", import.meta.url),
  "utf8",
);

if (
  !loginRouteSource.includes('name="next"') ||
  !loginRouteSource.includes('name="companyName"') ||
  !loginRouteSource.includes('name="productType"')
) {
  console.error("Expected login page to preserve onboarding handoff params.");
  process.exit(1);
}

const brandDashboardSource = readFileSync(
  new URL("../src/app/[locale]/dashboard/brand/page.tsx", import.meta.url),
  "utf8",
);

if (brandDashboardSource.includes("Create campaign")) {
  console.error("Expected brand dashboard create form UI to be removed.");
  process.exit(1);
}

if (
  onboardingShellSource.includes("inside the landing flow.") ||
  onboardingShellSource.includes("This page follows the seven-step onboarding reference")
) {
  console.error("Expected onboarding shell hero copy to be removed.");
  process.exit(1);
}

if (onboardingShellSource.includes("UGC Tank")) {
  console.error("Expected onboarding shell copy to use UGC Hits instead of UGC Tank.");
  process.exit(1);
}

if (
  !onboardingShellSource.includes("overflow-x-auto") ||
  !onboardingShellSource.includes("Create your campaign")
) {
  console.error("Expected onboarding shell to render a horizontal step rail with the campaign heading.");
  process.exit(1);
}

console.log("Verified get-started copy, onboarding-brand route, brand handoff, and simplified onboarding layout.");
