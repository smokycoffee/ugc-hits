import test from "node:test";
import assert from "node:assert/strict";

import { getCreatorDashboardPageState } from "../../src/lib/platform/creator-dashboard";

test("getCreatorDashboardPageState returns an applied success state", () => {
  assert.deepEqual(
    getCreatorDashboardPageState({
      applied: "1",
    }),
    {
      error: null,
      applied: true,
    },
  );
});

test("getCreatorDashboardPageState decodes creator dashboard errors", () => {
  assert.deepEqual(
    getCreatorDashboardPageState({
      error: encodeURIComponent('Campaign is not matched to this creator'),
    }),
    {
      error: "Campaign is not matched to this creator",
      applied: false,
    },
  );
});
