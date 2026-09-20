import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Check, Inbox, Search, ShieldBan, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminOverview } from "@/components/uyjoy/admin/overview";
import { StatusBadge } from "@/components/uyjoy/dashboard/shell";
import { BrandLockup } from "@/components/uyjoy/brand-mark";
import { RequireAuth } from "@/components/uyjoy/require-auth";
import { EmptyState, ErrorState } from "@/components/uyjoy/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";
import { formatListingPrice, useCurrency } from "@/lib/currency";
import type { Listing } from "@/lib/listing";
import { useAdminUsers, useModerate, useModerationQueue, useUserAction } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — UyJoy.uz" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <RequireAuth role="admin">
      <AdminPage />
    </RequireAuth>
  ),
});

type Tab = "overview" | "queue" | "listings" | "users";

function AdminPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t.admin.overview },
    { id: "queue", label: t.admin.queue },
    { id: "listings", label: t.admin.listings },
    { id: "users", label: t.admin.users },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="shell flex h-16 items-center gap-4">
          <Link to="/" className="group" aria-label="UyJoy.uz">
            <BrandLockup />
          </Link>
          <span className="rounded-md bg-ink px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-white uppercase">
            {t.admin.title}
          </span>

          {/* Tabs share the row from md up; on phones they get their own scrollable row below */}
          <nav className="ml-auto hidden gap-1 md:flex" aria-label={t.admin.title}>
            {tabs.map((item) => (
              <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
                {item.label}
              </TabButton>
            ))}
          </nav>
          <span className="hidden truncate text-sm text-muted-foreground lg:block">
            {user?.email}
          </span>
        </div>

        <nav
          className="scrollbar-hide flex gap-1 overflow-x-auto px-3 pb-2 md:hidden"
          aria-label={t.admin.title}
        >
          {tabs.map((item) => (
            <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
              {item.label}
            </TabButton>
          ))}
        </nav>
      </header>

      <main className="shell flex-1 py-8">
        {tab === "overview" && <AdminOverview onOpenQueue={() => setTab("queue")} />}
        {tab === "queue" && <Queue status="pending" />}
        {tab === "listings" && <Queue status="active" allowStatusSwitch />}
        {tab === "users" && <UsersTab />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Queue({
  status: initial,
  allowStatusSwitch = false,
}: {
  status: string;
  allowStatusSwitch?: boolean;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(initial);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useModerationQueue(status, page);
  const moderate = useModerate();
  const [rejecting, setRejecting] = useState<Listing | null>(null);

  const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : t.common.error);

  const act = (listing: Listing, action: "approve" | "archive") =>
    moderate.mutate(
      { propertyId: listing.id, action },
      {
        onSuccess: () =>
          toast.success(action === "approve" ? t.admin.approved : t.admin.archiveAction),
        onError,
      },
    );

  return (
    <div className="space-y-5">
      {allowStatusSwitch && (
        <div className="flex flex-wrap gap-1">
          {["active", "rejected", "archived", "paused", "draft"].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                status === s ? "bg-secondary" : "text-muted-foreground",
              )}
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : !isLoading && (data?.listings.length ?? 0) === 0 ? (
        <EmptyState icon={Inbox} title={t.admin.queueEmpty} description={t.admin.queueEmptyDesc} />
      ) : (
        <ul className="space-y-3" aria-busy={isLoading}>
          {(data?.listings ?? []).map((l) => (
            <QueueRow
              key={l.id}
              listing={l}
              busy={moderate.isPending}
              onApprove={l.status === "pending" ? () => act(l, "approve") : undefined}
              onReject={l.status === "pending" ? () => setRejecting(l) : undefined}
              onArchive={l.status !== "archived" ? () => act(l, "archive") : undefined}
            />
          ))}
        </ul>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t.common.previous}
          </Button>
          <span className="tnum text-sm text-muted-foreground">
            {page} {t.common.of} {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t.common.next}
          </Button>
        </div>
      )}

      <RejectDialog
        listing={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) =>
          rejecting &&
          moderate.mutate(
            { propertyId: rejecting.id, action: "reject", reason },
            {
              onSuccess: () => {
                toast.success(t.admin.rejected);
                setRejecting(null);
              },
              onError,
            },
          )
        }
        pending={moderate.isPending}
      />
    </div>
  );
}

function QueueRow({
  listing: l,
  busy,
  onApprove,
  onReject,
  onArchive,
}: {
  listing: Listing;
  busy: boolean;
  onApprove?: (() => void) | undefined;
  onReject?: (() => void) | undefined;
  onArchive?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row">
      <img src={l.image} alt="" className="h-28 w-full shrink-0 rounded-lg object-cover md:w-40" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={l.status} />
          <span className="text-xs text-muted-foreground">
            {new Date(l.createdAt).toLocaleString()}
          </span>
          {l.owner && (
            <span className="text-xs text-muted-foreground">
              · {t.admin.submittedBy}: {l.owner.name}
            </span>
          )}
        </div>
        <Link
          to="/elonlar/$id"
          params={{ id: l.id }}
          className="mt-1.5 block font-semibold hover:text-primary"
        >
          {l.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {l.district}, {l.city} · {l.address} ·{" "}
          <span className="tnum font-medium text-foreground">
            {formatListingPrice(l.price, l.deal, currency, format)}
          </span>{" "}
          · <span className="tnum">{l.area}</span> m² · {l.rooms} {t.property.rooms.toLowerCase()} ·{" "}
          {l.images.length} {t.postListing.photos.toLowerCase()}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
        {l.rejectionReason && <p className="mt-2 text-sm text-destructive">{l.rejectionReason}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">
        {onApprove && (
          <Button size="sm" disabled={busy} onClick={onApprove}>
            <Check className="size-3.5" /> {t.admin.approve}
          </Button>
        )}
        {onReject && (
          <Button size="sm" variant="outline" disabled={busy} onClick={onReject}>
            <X className="size-3.5" /> {t.admin.reject}
          </Button>
        )}
        {onArchive && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onArchive}>
            <Archive className="size-3.5" /> {t.admin.archiveAction}
          </Button>
        )}
      </div>
    </li>
  );
}

function RejectDialog({
  listing,
  onClose,
  onConfirm,
  pending,
}: {
  listing: Listing | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <Dialog open={listing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.admin.reject}</DialogTitle>
          <DialogDescription>{listing?.title}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm(reason.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">{t.admin.rejectReason}</Label>
            <Textarea
              id="reject-reason"
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.admin.rejectReasonHint}</p>
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            loading={pending}
            disabled={reason.trim().length < 10}
          >
            {t.admin.reject}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminUsers(search, page);
  const action = useUserAction();

  const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : t.common.error);
  const totalPages = data
    ? Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit))
    : 1;

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t.admin.searchUsers}
          className="pl-9"
          aria-label={t.admin.searchUsers}
        />
      </div>

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm" aria-busy={isLoading}>
            <thead className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.auth.name}</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">{t.auth.phone}</th>
                <th className="px-4 py-3 font-semibold">{t.nav.profile}</th>
                <th className="px-4 py-3 font-semibold">{t.admin.listingsCount}</th>
                <th className="px-4 py-3 font-semibold">{t.common.status}</th>
                <th className="px-4 py-3 text-right font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.users ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="tnum px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="tnum px-4 py-3">{u.listings}</td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <ShieldCheck className="size-3.5" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <ShieldBan className="size-3.5" /> {t.admin.blocked}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== "admin" && u.id !== me?.id && (
                      <Button
                        size="sm"
                        variant={u.isActive ? "outline" : "default"}
                        disabled={action.isPending}
                        onClick={() =>
                          action.mutate(
                            { userId: u.id, action: u.isActive ? "block" : "unblock" },
                            { onError },
                          )
                        }
                      >
                        {u.isActive ? t.admin.block : t.admin.unblock}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.users.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t.common.previous}
          </Button>
          <span className="tnum text-sm text-muted-foreground">
            {page} {t.common.of} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t.common.next}
          </Button>
        </div>
      )}
    </div>
  );
}
