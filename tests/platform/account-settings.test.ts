import test from "node:test";
import assert from "node:assert/strict";

import { getBrandAccountSettingsSections } from "../../src/lib/platform/account-settings";

test("brand account settings sections keep the approved tab order and destructive styling", () => {
  const sections = getBrandAccountSettingsSections();

  assert.deepEqual(
    sections.map((section) => section.value),
    ["account", "notifications", "danger"],
  );
  assert.equal(sections[2]?.tone, "danger");
  assert.equal(
    sections[2]?.description,
    "Permanently delete your account and all associated data.",
  );
});

test("account settings metadata keeps functional account copy separate from placeholder panels", () => {
  const [accountSection, notificationsSection] = getBrandAccountSettingsSections();

  assert.equal(accountSection?.title, "Email address");
  assert.match(accountSection?.body ?? "", /signed in/i);
  assert.equal(notificationsSection?.title, "Email notifications");
  assert.match(notificationsSection?.body ?? "", /cannot be turned off/i);
});
