import test from "node:test";
import assert from "node:assert/strict";

import { resolveSharedLoginTarget } from "../../src/lib/platform/login-flow";

test("resolveSharedLoginTarget preserves the brand onboarding path when brand lead context is present", () => {
  const target = resolveSharedLoginTarget("pl", {
    next: "/pl/onboarding-brand?companyName=Acme",
    companyName: "Acme",
    productType: "Supplements",
    existingRole: "creator",
  });

  assert.deepEqual(target, {
    next: "/pl/onboarding-brand?companyName=Acme",
    role: "brand",
  });
});

test("resolveSharedLoginTarget sends existing creators to the creator dashboard by default", () => {
  const target = resolveSharedLoginTarget("en", {
    next: "",
    companyName: "",
    productType: "",
    existingRole: "creator",
  });

  assert.deepEqual(target, {
    next: "/en/dashboard/creator",
    role: "creator",
  });
});

test("resolveSharedLoginTarget sends existing admins to admin invites by default", () => {
  const target = resolveSharedLoginTarget("pl", {
    next: "",
    companyName: "",
    productType: "",
    existingRole: "admin",
  });

  assert.deepEqual(target, {
    next: "/pl/admin/invites",
    role: "admin",
  });
});
