import { markNotificationReadAction } from "@/lib/platform/actions";

type NotificationFeedProps = {
  locale: "pl" | "en";
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    status: "unread" | "read";
    created_at: string;
  }>;
};

export function NotificationFeed({
  locale,
  notifications,
}: NotificationFeedProps) {
  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          No notifications yet.
        </div>
      ) : (
        notifications.map((notification) => (
          <form
            key={notification.id}
            action={markNotificationReadAction}
            className={`rounded-[1.4rem] border px-4 py-4 ${
              notification.status === "unread"
                ? "border-teal-200 bg-teal-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="notificationId" value={notification.id} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notification.body}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {notification.status === "unread" ? (
                <button
                  type="submit"
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </form>
        ))
      )}
    </div>
  );
}
