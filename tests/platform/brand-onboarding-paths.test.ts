import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBrandLoginPath,
  buildBrandOnboardingPath,
} from "../../src/lib/platform/brand-onboarding";

test("buildBrandOnboardingPath preserves lead params", () => {
  const path = buildBrandOnboardingPath("en", {
    companyName: "Acme Labs",
    productType: "Supplements",
  });

  assert.equal(
    path,
    "/en/onboarding-brand?companyName=Acme+Labs&productType=Supplements",
  );
});

test("buildBrandLoginPath sends the brand lead through login with onboarding next", () => {
  const path = buildBrandLoginPath("pl", {
    companyName: "Aurora",
    productType: "Beauty",
  });

  assert.equal(
    path,
    "/pl/login?companyName=Aurora&productType=Beauty&next=%2Fpl%2Fonboarding-brand%3FcompanyName%3DAurora%26productType%3DBeauty",
  );
});
