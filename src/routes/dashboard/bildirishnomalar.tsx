import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/uyjoy/dashboard/shell";
import { EmptyState, ErrorState } from "@/components/uyjoy/states";
import { relativeTime, useTranslation } from "@/i18n";
import { describeNotification, type NotificationHref } from "@/lib/notification-text";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/bildirishnomalar")({
  head: () => ({
    meta: [{ title: "Bildirishnomalar — UyJoy.uz" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell title="notifications">
      <Notifications />
    </DashboardShell>
  ),
});

function Notifications() {
  const { t, language } = useTranslation();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, isError, error, refetch } = useNotifications(unreadOnly);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();

  const items = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : t.common.error);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="segmented bg-secondary">
          {[false, true].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={unreadOnly === value}
              onClick={() => setUnreadOnly(value)}
              className={cn(
                "segmented-item",
                unreadOnly === value ? "bg-card shadow-xs" : "text-muted-foreground",
              )}
            >
              {value ? t.notifications.unreadOnly : t.notifications.all}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <span className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
            {unreadCount} {t.notifications.unread}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={unreadCount === 0 || markAll.isPending}
          onClick={() => markAll.mutate(undefined, { onError })}
        >
          <Check className="size-4" />
          <span className="hidden sm:inline">{t.notifications.markAllRead}</span>
        </Button>
      </div>

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : !isLoading && items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? t.notifications.emptyUnread : t.notifications.empty}
          {...(unreadOnly ? {} : { description: t.notifications.emptyDesc })}
        />
      ) : (
        <ul className="space-y-2.5" aria-busy={isLoading}>
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onMarkRead={() => markRead.mutate(n.id, { onError })}
              onRemove={() => remove.mutate(n.id, { onError })}
              busy={markRead.isPending || remove.isPending}
              relative={relativeTime(n.createdAt, language)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  onRemove,
  busy,
  relative,
}: {
  notification: AppNotification;
  onMarkRead: () => void;
  onRemove: () => void;
  busy: boolean;
  relative: string;
}) {
  const { t, language } = useTranslation();
  const view = describeNotification(notification, t, language);

  return (
    <li
      className={cn(
        "flex gap-3 rounded-xl border p-4 transition-colors",
        notification.isRead
          ? "border-border bg-card"
          : "border-primary/25 bg-primary-soft/40 shadow-xs",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          notification.isRead ? "bg-transparent" : "bg-primary",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="font-semibold">{view.title}</p>
          <time dateTime={notification.createdAt} className="text-xs text-muted-foreground">
            {relative}
          </time>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{view.body}</p>
        {view.href && (
          <NotificationLink
            href={view.href}
            label={t.notifications.open}
            onNavigate={notification.isRead ? undefined : onMarkRead}
          />
        )}
      </div>

      <div className="flex shrink-0 items-start gap-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.notifications.markRead}
            title={t.notifications.markRead}
            disabled={busy}
            onClick={onMarkRead}
          >
            <Check className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t.notifications.remove}
          title={t.notifications.remove}
          disabled={busy}
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}

/** Opening a notification counts as reading it. */
function NotificationLink({
  href,
  label,
  onNavigate,
}: {
  href: NotificationHref;
  label: string;
  onNavigate?: (() => void) | undefined;
}) {
  const className = "mt-2 inline-block text-sm font-semibold text-primary hover:underline";

  if (href.to === "/elonlar/$id") {
    return (
      <Link to={href.to} params={href.params} className={className} onClick={onNavigate}>
        {label}
      </Link>
    );
  }
  return (
    <Link to={href.to} className={className} onClick={onNavigate}>
      {label}
    </Link>
  );
}
