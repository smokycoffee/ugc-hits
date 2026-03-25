type ConfirmRedirectState = {
  next: string;
  role: string | null;
  inviteCode: string | null;
};

function sanitizeNextPath(next: string | null | undefined, fallback: string) {
  if (!next || !next.startsWith("/")) {
    return fallback;
  }

  return next;
}

export function resolveConfirmRedirectState(
  origin: string,
  searchParams: URLSearchParams,
): ConfirmRedirectState {
  const redirectTo = searchParams.get("redirect_to");
  const fallbackNext = sanitizeNextPath(searchParams.get("next"), "/pl/login");

  if (!redirectTo) {
    return {
      next: fallbackNext,
      role: searchParams.get("role"),
      inviteCode: searchParams.get("invite_code"),
    };
  }

  const redirectUrl = new URL(redirectTo, origin);

  return {
    next: sanitizeNextPath(
      `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`,
      fallbackNext,
    ),
    role: redirectUrl.searchParams.get("role") ?? searchParams.get("role"),
    inviteCode:
      redirectUrl.searchParams.get("invite_code") ?? searchParams.get("invite_code"),
  };
}
