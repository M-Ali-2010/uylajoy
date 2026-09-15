import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { db, properties } from "@/db";
import { errorResponse } from "@/lib/server/http";

/**
 * Counts of published listings by type and by city — what the homepage
 * categories and city explorer show. Two grouped queries, cacheable.
 */
export const Route = createFileRoute("/api/properties/stats")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const [byType, byCity, [totals]] = await Promise.all([
            db
              .select({ type: properties.type, count: sql<number>`count(*)::int` })
              .from(properties)
              .where(eq(properties.status, "active"))
              .groupBy(properties.type),
            db
              .select({ city: properties.city, count: sql<number>`count(*)::int` })
              .from(properties)
              .where(eq(properties.status, "active"))
              .groupBy(properties.city),
            db
              .select({ total: sql<number>`count(*)::int` })
              .from(properties)
              .where(eq(properties.status, "active")),
          ]);

          return json(
            {
              success: true,
              total: totals?.total ?? 0,
              byType: Object.fromEntries(byType.map((r) => [r.type, r.count])),
              byCity: Object.fromEntries(byCity.map((r) => [r.city, r.count])),
            },
            { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } },
          );
        } catch (error) {
          return errorResponse(error, "Failed to fetch stats");
        }
      },
    },
  },
});
