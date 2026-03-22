import test from "node:test";
import assert from "node:assert/strict";

import { buildBrandMagicLinkRedirect, buildCreatorInviteRedirect } from "../../src/lib/platform/auth-redirects";

test("brand magic-link redirect carries the onboarding next path", () => {
  const redirect = buildBrandMagicLinkRedirect(
    "http://localhost:3000",
    "en",
    "/en/onboarding-brand?companyName=Acme&productType=Supplements",
  );

  assert.equal(
    redirect,
    "http://localhost:3000/en/onboarding-brand?companyName=Acme&productType=Supplements&role=brand",
  );
});

test("creator invite redirect points directly to the dashboard and carries invite code", () => {
  const redirect = buildCreatorInviteRedirect(
    "http://localhost:3000",
    "pl",
    "UGC12345",
  );

  assert.equal(
    redirect,
    "http://localhost:3000/pl/dashboard/creator?role=creator&invite_code=UGC12345",
  );
});
