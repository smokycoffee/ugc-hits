import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "@/i18n/messages";
import { routing, type AppLocale } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = routing.locales.includes(requestedLocale as AppLocale)
    ? (requestedLocale as AppLocale)
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
