import test from "node:test";
import assert from "node:assert/strict";

import {
  hashInviteCode,
  isInviteCodeValid,
  normalizeInviteCode,
} from "../../src/lib/platform/invite-code";

test("normalizeInviteCode uppercases and strips separators", () => {
  assert.equal(normalizeInviteCode(" ugc-hits 2026 "), "UGCHITS2026");
});

test("isInviteCodeValid rejects short codes after normalization", () => {
  assert.equal(isInviteCodeValid("abc-12"), false);
  assert.equal(isInviteCodeValid("ugc-hits-2026"), true);
});

test("hashInviteCode is stable across formatting variants", async () => {
  const first = await hashInviteCode("ugc-hits-2026");
  const second = await hashInviteCode("UGC HITS 2026");

  assert.equal(first, second);
});
