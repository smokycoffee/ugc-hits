import enMessages from "../../messages/en.json";

import type { AppLocale } from "@/i18n/routing";

export type Messages = typeof enMessages;

export async function loadMessages(locale: AppLocale): Promise<Messages> {
  return (await import(`../../messages/${locale}.json`)).default as Messages;
}
