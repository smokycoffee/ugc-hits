import type { AppLocale } from "@/i18n/routing";
import { PlatformPageShell } from "@/components/platform/page-shell";
import { sendMessageAction } from "@/lib/platform/actions";
import {
  getConversationPage,
  type ConversationMessageSummary,
} from "@/lib/platform/data";

type Props = {
  params: Promise<{ locale: string; conversationId: string }>;
};

export default async function MessagesPage({ params }: Props) {
  const { locale, conversationId } = await params;
  const data = await getConversationPage(locale as AppLocale, conversationId);
  const campaign = Array.isArray(data.conversation.campaigns)
    ? data.conversation.campaigns[0]
    : data.conversation.campaigns;
  const brand = Array.isArray(data.conversation.brands)
    ? data.conversation.brands[0]
    : data.conversation.brands;
  const creator = Array.isArray(data.conversation.creators)
    ? data.conversation.creators[0]
    : data.conversation.creators;

  return (
    <PlatformPageShell
      eyebrow="Messaging"
      title={campaign?.title ?? "Conversation"}
      description="Message delivery updates the conversation, dashboard notifications, and the email queue from the same event source."
      profileLabel={data.profile.email}
      actions={
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Sign out
          </button>
        </form>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
          <div className="space-y-3">
            {data.messages.map((message: ConversationMessageSummary) => (
              <article
                key={message.id}
                className={`max-w-2xl rounded-[1.2rem] px-4 py-3 ${
                  message.sender_profile_id === data.profile.id
                    ? "ml-auto bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-950"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {message.profiles?.full_name ?? message.profiles?.email ?? "Participant"}
                </p>
                <p className="mt-2 text-sm leading-6">{message.body}</p>
                <p className="mt-2 text-xs opacity-60">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
          <form action={sendMessageAction} className="mt-6 space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="conversationId" value={conversationId} />
            <textarea
              name="body"
              placeholder="Write your message"
              className="min-h-32 w-full rounded-[1rem] border border-slate-300 bg-slate-50 px-4 py-3"
              required
            />
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Send message
            </button>
          </form>
        </section>

        <aside className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-950">Conversation context</h2>
          <dl className="mt-5 space-y-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-950">Campaign</dt>
              <dd className="mt-1">{campaign?.title ?? "Untitled"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Brand</dt>
              <dd className="mt-1">{brand?.company_name ?? "Brand"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Creator</dt>
              <dd className="mt-1">{creator?.display_name ?? "Creator"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </PlatformPageShell>
  );
}
