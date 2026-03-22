import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { resolveConfirmRedirectState } from "@/lib/platform/confirm-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const { next, role, inviteCode } = resolveConfirmRedirectState(
    origin,
    searchParams,
  );
  const redirectTo = new URL(next, origin);

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      if (role === "brand" || role === "creator") {
        const { error: syncError } = await supabase.rpc("sync_profile_role", {
          requested_role: role,
        });

        if (syncError) {
          return NextResponse.redirect(
            new URL(
              `/auth/error?reason=${encodeURIComponent(syncError.message)}`,
              origin,
            ),
          );
        }
      }

      if (inviteCode) {
        const normalizedInviteCode = inviteCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const { error: redeemError } = await supabase.rpc("redeem_platform_invite", {
          invite_code: normalizedInviteCode,
        });

        if (redeemError) {
          return NextResponse.redirect(
            new URL(
              `/auth/error?reason=${encodeURIComponent(redeemError.message)}`,
              origin,
            ),
          );
        }
      }

      return NextResponse.redirect(redirectTo);
    }

    return NextResponse.redirect(
      new URL(`/auth/error?reason=${encodeURIComponent(error.message)}`, origin),
    );
  }

  return NextResponse.redirect(
    new URL(`/auth/error?reason=${encodeURIComponent("Missing token_hash or type")}`, origin),
  );
}
