import test from "node:test";
import assert from "node:assert/strict";

import {
  buildNotificationArtifacts,
  getMessageEmailWindowStart,
} from "../../src/lib/platform/notification-artifacts";

test("creator application artifacts notify and email the brand", () => {
  const artifacts = buildNotificationArtifacts({
    eventType: "creator_applied_to_campaign",
    actorProfileId: "creator-1",
    campaignId: "campaign-1",
    applicationId: "application-1",
    recipients: [
      {
        profileId: "brand-1",
        email: "brand@example.com",
        role: "brand",
      },
    ],
  });

  assert.equal(artifacts.notifications.length, 1);
  assert.equal(artifacts.notifications[0]?.type, "creator_applied_to_campaign");
  assert.equal(artifacts.emailJobs.length, 1);
  assert.equal(artifacts.emailJobs[0]?.template, "new_application_received");
});

test("message artifacts queue a single email for the recipient", () => {
  const windowStart = getMessageEmailWindowStart(
    new Date("2026-03-22T12:14:00.000Z"),
  );
  const artifacts = buildNotificationArtifacts({
    eventType: "message_sent",
    actorProfileId: "brand-1",
    conversationId: "conversation-1",
    recipients: [
      {
        profileId: "creator-1",
        email: "creator@example.com",
        role: "creator",
      },
    ],
    occurredAt: new Date("2026-03-22T12:14:00.000Z"),
  });

  assert.equal(windowStart.toISOString(), "2026-03-22T12:00:00.000Z");
  assert.equal(artifacts.emailJobs.length, 1);
  assert.equal(
    artifacts.emailJobs[0]?.dedupeKey,
    "message:conversation-1:creator-1:2026-03-22T12:00:00.000Z",
  );
});
