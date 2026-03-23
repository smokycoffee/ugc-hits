export type AdminInviteRecord = {
  id: string;
  email: string;
  status: string;
  expires_at: string;
  invite_code?: string | null;
};

export type InviteEmailJobRecord = {
  created_at: string;
  payload: {
    invite_id?: string;
    invite_code?: string;
  } | null;
};

export function attachInviteCodes(
  invites: AdminInviteRecord[],
  emailJobs: InviteEmailJobRecord[],
) {
  const latestCodeByInviteId = new Map<string, { created_at: string; invite_code: string }>();

  for (const job of emailJobs) {
    const inviteId = job.payload?.invite_id;
    const inviteCode = job.payload?.invite_code;

    if (!inviteId || !inviteCode) {
      continue;
    }

    const existing = latestCodeByInviteId.get(inviteId);

    if (!existing || job.created_at > existing.created_at) {
      latestCodeByInviteId.set(inviteId, {
        created_at: job.created_at,
        invite_code: inviteCode,
      });
    }
  }

  return invites.map((invite) => ({
    ...invite,
    invite_code: latestCodeByInviteId.get(invite.id)?.invite_code ?? null,
  }));
}
