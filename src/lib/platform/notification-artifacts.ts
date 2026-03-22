export type PlatformEventType =
  | "creator_invited_to_platform"
  | "creator_activated_account"
  | "campaign_published"
  | "campaign_matched_to_creator"
  | "creator_applied_to_campaign"
  | "brand_accepted_application"
  | "brand_rejected_application"
  | "message_sent";

export type EventRecipient = {
  profileId: string;
  email: string;
  role: "brand" | "creator" | "admin";
};

export type NotificationArtifactInput = {
  eventType: PlatformEventType;
  actorProfileId: string;
  recipients: EventRecipient[];
  campaignId?: string;
  applicationId?: string;
  conversationId?: string;
  occurredAt?: Date;
};

type NotificationRecord = {
  recipientProfileId: string;
  type: PlatformEventType;
  actorProfileId: string;
  campaignId?: string;
  applicationId?: string;
  conversationId?: string;
};

type EmailJobRecord = {
  recipientProfileId: string;
  email: string;
  template:
    | "platform_invite"
    | "campaign_matched"
    | "new_application_received"
    | "application_accepted"
    | "application_rejected"
    | "new_message";
  dedupeKey: string;
};

type NotificationArtifacts = {
  notifications: NotificationRecord[];
  emailJobs: EmailJobRecord[];
};

const templateMap: Record<PlatformEventType, EmailJobRecord["template"] | null> =
  {
    creator_invited_to_platform: "platform_invite",
    creator_activated_account: null,
    campaign_published: null,
    campaign_matched_to_creator: "campaign_matched",
    creator_applied_to_campaign: "new_application_received",
    brand_accepted_application: "application_accepted",
    brand_rejected_application: "application_rejected",
    message_sent: "new_message",
  };

export function getMessageEmailWindowStart(date: Date, windowMinutes = 15) {
  const windowMs = windowMinutes * 60 * 1000;
  const bucket = Math.floor(date.getTime() / windowMs) * windowMs;

  return new Date(bucket);
}

export function buildNotificationArtifacts(
  input: NotificationArtifactInput,
): NotificationArtifacts {
  const occurredAt = input.occurredAt ?? new Date();
  const notifications = input.recipients.map((recipient) => ({
    recipientProfileId: recipient.profileId,
    type: input.eventType,
    actorProfileId: input.actorProfileId,
    campaignId: input.campaignId,
    applicationId: input.applicationId,
    conversationId: input.conversationId,
  }));

  const template = templateMap[input.eventType];
  const emailJobs =
    template === null
      ? []
      : input.recipients.map((recipient) => ({
          recipientProfileId: recipient.profileId,
          email: recipient.email,
          template,
          dedupeKey:
            input.eventType === "message_sent" && input.conversationId
              ? `message:${input.conversationId}:${recipient.profileId}:${getMessageEmailWindowStart(
                  occurredAt,
                ).toISOString()}`
              : `${input.eventType}:${recipient.profileId}:${input.campaignId ?? input.applicationId ?? input.conversationId ?? "none"}`,
        }));

  return { notifications, emailJobs };
}
