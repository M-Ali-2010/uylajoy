import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Deployment check: is the database reachable and migrated? Returns 503
 * with the reason when it is not, so an operator sees "wrong DATABASE_URL"
 * or "migrations not applied" instead of guessing from a blank site.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const checks: Record<string, "ok" | string> = {
          env: process.env["DATABASE_URL"] ? "ok" : "DATABASE_URL missing",
          jwt: process.env["JWT_SECRET"] ? "ok" : "JWT_SECRET missing",
          cloudinary: process.env["CLOUDINARY_CLOUD_NAME"]
            ? "ok"
            : "not configured (uploads disabled)",
          database: "unknown",
        };

        try {
          // Never let the health check itself hang on a dead socket
          await Promise.race([
            db.execute(sql`select 1`),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout after 8s")), 8000),
            ),
          ]);
          // Reachable — now: is the schema there? The newest table proves all
          // three migrations ran, whichever tool applied them.
          const [row] = await db.execute<{ present: boolean }>(
            sql`select to_regclass('public.analytics_events') is not null as present`,
          );
          checks["database"] = row?.present
            ? "ok"
            : "connected but not migrated — run: npx drizzle-kit migrate";
        } catch (error) {
          const cause = (error as { cause?: { code?: string; message?: string } }).cause;
          const code = (error as { code?: string }).code ?? cause?.code ?? "";
          const detail = code || cause?.message || (error as Error).message;
          checks["database"] = `unreachable (${String(detail).slice(0, 80)})`;
        }

        const healthy = Object.values(checks).every(
          (v) => v.startsWith("ok") || v.startsWith("not configured"),
        );
        return json({ ok: healthy, checks }, { status: healthy ? 200 : 503 });
      },
    },
  },
});
