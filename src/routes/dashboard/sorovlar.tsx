import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/uyjoy/dashboard/shell";
import { EmptyState, ErrorState } from "@/components/uyjoy/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n";
import { useLeads, useUpdateLeadStatus, type Lead } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/sorovlar")({
  head: () => ({
    meta: [{ title: "So'rovlar — UyJoy.uz" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell title="leads">
      <Leads />
    </DashboardShell>
  ),
});

function Leads() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useLeads();
  const update = useUpdateLeadStatus();

  const statuses: { value: Lead["status"]; label: string }[] = [
    { value: "new", label: t.dashboard.leadNew },
    { value: "contacted", label: t.dashboard.leadContacted },
    { value: "qualified", label: t.dashboard.leadQualified },
    { value: "closed", label: t.dashboard.leadClosed },
  ];

  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  if (!isLoading && (data?.length ?? 0) === 0) {
    return (
      <EmptyState icon={Users} title={t.dashboard.noLeads} description={t.dashboard.noLeadsDesc} />
    );
  }

  return (
    <ul className="space-y-3" aria-busy={isLoading}>
      {(data ?? []).map((lead) => (
        <li
          key={lead.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <p className="font-semibold">{lead.name}</p>
              <a href={`tel:${lead.phone}`} className="tnum text-sm text-primary hover:underline">
                {lead.phone}
              </a>
              {lead.email && <span className="text-sm text-muted-foreground">{lead.email}</span>}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {lead.property?.title ?? ""} · {new Date(lead.createdAt).toLocaleString()}
            </p>
            {lead.message && <p className="mt-2 text-sm">{lead.message}</p>}
          </div>
          <Select
            value={lead.status}
            onValueChange={(status) =>
              update.mutate(
                { id: lead.id, status: status as Lead["status"] },
                { onError: (e) => toast.error(e instanceof Error ? e.message : t.common.error) },
              )
            }
          >
            <SelectTrigger className="w-44" aria-label={t.common.status}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </li>
      ))}
    </ul>
  );
}
