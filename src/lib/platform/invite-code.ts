import { createHash } from "node:crypto";

const MIN_INVITE_CODE_LENGTH = 8;

export function normalizeInviteCode(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function isInviteCodeValid(value: string) {
  return normalizeInviteCode(value).length >= MIN_INVITE_CODE_LENGTH;
}

export async function hashInviteCode(value: string) {
  return createHash("sha256").update(normalizeInviteCode(value)).digest("hex");
}
