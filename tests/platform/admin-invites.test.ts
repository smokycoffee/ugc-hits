import test from "node:test";
import assert from "node:assert/strict";

import {
  attachInviteCodes,
  type AdminInviteRecord,
  type InviteEmailJobRecord,
} from "../../src/lib/platform/admin-invites";

test("attachInviteCodes maps the latest platform invite code onto pending invites", () => {
  const invites: AdminInviteRecord[] = [
    {
      id: "invite-1",
      email: "creator-one@example.com",
      status: "pending",
      expires_at: "2026-04-05T23:15:11.324104+00:00",
    },
    {
      id: "invite-2",
      email: "creator-two@example.com",
      status: "redeemed",
      expires_at: "2026-04-06T23:15:11.324104+00:00",
    },
  ];

  const emailJobs: InviteEmailJobRecord[] = [
    {
      created_at: "2026-03-22T23:15:11.324104+00:00",
      payload: {
        invite_id: "invite-1",
        invite_code: "OLDER12345",
      },
    },
    {
      created_at: "2026-03-23T08:00:00.000000+00:00",
      payload: {
        invite_id: "invite-1",
        invite_code: "NEWER67890",
      },
    },
    {
      created_at: "2026-03-23T09:00:00.000000+00:00",
      payload: {
        invite_id: "invite-missing",
        invite_code: "IGNORED0000",
      },
    },
  ];

  assert.deepEqual(attachInviteCodes(invites, emailJobs), [
    {
      id: "invite-1",
      email: "creator-one@example.com",
      status: "pending",
      expires_at: "2026-04-05T23:15:11.324104+00:00",
      invite_code: "NEWER67890",
    },
    {
      id: "invite-2",
      email: "creator-two@example.com",
      status: "redeemed",
      expires_at: "2026-04-06T23:15:11.324104+00:00",
      invite_code: null,
    },
  ]);
});
