import test from "node:test";
import assert from "node:assert/strict";

import { resolveConfirmRedirectState } from "../../src/lib/platform/confirm-redirect";

test("resolveConfirmRedirectState reads nested redirect_to parameters", () => {
  const state = resolveConfirmRedirectState(
    "http://localhost:3000",
    new URLSearchParams({
      redirect_to:
        "http://localhost:3000/pl/onboarding-brand?companyName=Acme&productType=Beauty&role=brand",
    }),
  );

  assert.equal(state.next, "/pl/onboarding-brand?companyName=Acme&productType=Beauty&role=brand");
  assert.equal(state.role, "brand");
});

test("resolveConfirmRedirectState falls back to direct query params", () => {
  const state = resolveConfirmRedirectState(
    "http://localhost:3000",
    new URLSearchParams({
      next: "/pl/dashboard/creator",
      role: "creator",
      invite_code: "ABC12345",
    }),
  );

  assert.equal(state.next, "/pl/dashboard/creator");
  assert.equal(state.role, "creator");
  assert.equal(state.inviteCode, "ABC12345");
});
