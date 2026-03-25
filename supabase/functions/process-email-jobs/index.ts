import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "";
const appUrl = Deno.env.get("APP_URL") ?? "";

function renderEmail(template: string, payload: Record<string, unknown>) {
  const campaignTitle = String(payload.campaign_title ?? "UGC Hits");
  const conversationId = String(payload.conversation_id ?? "");
  const inviteCode = String(payload.invite_code ?? "");
  const inviteEmail = String(payload.invite_email ?? "");
  const messagePreview = String(payload.message_preview ?? "");

  switch (template) {
    case "platform_invite":
      return {
        subject: "Your UGC Hits creator invite",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>Your invite is ready</h1>
            <p>Your creator profile was approved for UGC Hits.</p>
            <p><strong>Invite code:</strong> ${inviteCode}</p>
            <p><a href="${appUrl}/pl/invite?email=${encodeURIComponent(inviteEmail)}">Activate your account</a></p>
          </div>
        `,
      };
    case "campaign_matched":
      return {
        subject: `New matched campaign: ${campaignTitle}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>New matched campaign</h1>
            <p>${campaignTitle} is now available in your creator dashboard.</p>
            <p><a href="${appUrl}/pl/dashboard/creator">Review the campaign</a></p>
          </div>
        `,
      };
    case "new_application_received":
      return {
        subject: `New application for ${campaignTitle}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>New creator application</h1>
            <p>A creator just applied to ${campaignTitle}.</p>
            <p><a href="${appUrl}/pl/dashboard/brand">Review the applicant</a></p>
          </div>
        `,
      };
    case "application_accepted":
      return {
        subject: `Application accepted: ${campaignTitle}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>Your application was accepted</h1>
            <p>You were accepted for ${campaignTitle}.</p>
            <p><a href="${appUrl}/pl/dashboard/creator">Open your dashboard</a></p>
          </div>
        `,
      };
    case "application_rejected":
      return {
        subject: `Application update: ${campaignTitle}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>Your application was updated</h1>
            <p>The brand updated your application for ${campaignTitle}.</p>
            <p><a href="${appUrl}/pl/dashboard/creator">Open your dashboard</a></p>
          </div>
        `,
      };
    case "new_message":
      return {
        subject: `New message in ${campaignTitle}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>New message</h1>
            <p>${messagePreview}</p>
            <p><a href="${appUrl}/pl/messages/${conversationId}">Open the conversation</a></p>
          </div>
        `,
      };
    default:
      return {
        subject: "New UGC Hits update",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;line-height:1.6;">
            <h1>New update</h1>
            <p>You have a new update in UGC Hits.</p>
            <p><a href="${appUrl}/pl/login">Open the platform</a></p>
          </div>
        `,
      };
  }
}

async function sendResendEmail(job: Record<string, unknown>) {
  const payload = (job.payload as Record<string, unknown> | null) ?? {};
  const rendered = renderEmail(String(job.template ?? "platform_update"), payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [job.email],
      subject: rendered.subject,
      html: rendered.html,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

Deno.serve(async () => {
  const now = new Date().toISOString();
  const { data: jobs, error } = await supabase
    .from("email_jobs")
    .select("*")
    .in("status", ["pending", "failed"])
    .lte("scheduled_at", now)
    .order("created_at", { ascending: true })
    .limit(25);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const processed: Array<{ id: string; status: string }> = [];

  for (const job of jobs ?? []) {
    try {
      await supabase
        .from("email_jobs")
        .update({
          status: "processing",
          attempts: Number(job.attempts ?? 0) + 1,
        })
        .eq("id", job.id);

      await sendResendEmail(job);

      await supabase
        .from("email_jobs")
        .update({
          status: "sent",
          processed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", job.id);

      processed.push({ id: String(job.id), status: "sent" });
    } catch (sendError) {
      const attempts = Number(job.attempts ?? 0) + 1;
      const maxAttempts = Number(job.max_attempts ?? 3);
      const failedStatus = attempts >= maxAttempts ? "failed" : "pending";
      const nextRetry = new Date(Date.now() + 60_000).toISOString();

      await supabase
        .from("email_jobs")
        .update({
          status: failedStatus,
          scheduled_at: nextRetry,
          last_error:
            sendError instanceof Error ? sendError.message : "Email send failed",
        })
        .eq("id", job.id);

      processed.push({ id: String(job.id), status: failedStatus });
    }
  }

  return new Response(JSON.stringify({ processed }), {
    headers: { "Content-Type": "application/json" },
  });
});
