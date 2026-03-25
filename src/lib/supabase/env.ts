export function getSupabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

  if (!value) {
    throw new Error(
      "Missing environment variable. Tried: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL",
    );
  }

  return value;
}

export function getSupabasePublishableKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      "Missing environment variable. Tried: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY",
    );
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error(
      "Missing environment variable. Tried: SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return value;
}

export function getAppUrl() {
  const value = process.env.APP_URL;

  if (!value) {
    throw new Error("Missing environment variable. Tried: APP_URL");
  }

  return value;
}

export function getCreatorApplicationUrl() {
  const value = process.env.NEXT_PUBLIC_CREATOR_APPLICATION_URL;

  if (!value) {
    throw new Error(
      "Missing environment variable. Tried: NEXT_PUBLIC_CREATOR_APPLICATION_URL",
    );
  }

  return value;
}

export function getResendFromEmail() {
  const value = process.env.RESEND_FROM_EMAIL;

  if (!value) {
    throw new Error("Missing environment variable. Tried: RESEND_FROM_EMAIL");
  }

  return value;
}
