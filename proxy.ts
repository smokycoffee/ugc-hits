import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { updateSession } from "./src/lib/supabase/proxy";
import { routing } from "./src/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
