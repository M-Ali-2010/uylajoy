"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

interface Health {
  ok: boolean;
  checks: Record<string, string>;
}

/**
 * Shows only when the deployment itself is broken (database unreachable or
 * not migrated). Visitors get a plain sentence instead of a site that looks
 * empty; operators get the exact check that failed.
 */
export function SetupBanner() {
  const { data } = useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<Health> => {
      const res = await fetch("/api/health");
      return (await res.json()) as Health;
    },
    staleTime: 60_000,
    retry: false,
  });

  const db = data?.checks["database"];
  if (!data || data.ok || !db || db.startsWith("ok")) return null;

  return (
    <div role="alert" className="border-b border-warning/40 bg-warning/15 text-sm">
      <div className="shell flex items-start gap-3 py-2.5">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
        <p>
          <span className="font-semibold">Server sozlanmagan / Сервер не настроен.</span>{" "}
          <code className="rounded bg-warning/20 px-1 py-0.5 text-xs">database: {db}</code>{" "}
          <span className="text-muted-foreground">— see docs/HANDOFF.md → «Production setup»</span>
        </p>
      </div>
    </div>
  );
}
