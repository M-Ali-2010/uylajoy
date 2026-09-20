import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db, properties } from "@/db";
import { errorResponse } from "@/lib/server/http";

/**
 * Market snapshot per city for residential listings, computed from what is
 * actually published:
 * median asking price per m² (sale, USD), median monthly rent per m², and
 * the implied gross yield where both exist. No history yet, so no "yearly
 * change" — we do not invent numbers.
 */
export const Route = createFileRoute("/api/properties/market")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const rows = await db
            .select({
              city: properties.city,
              dealType: properties.dealType,
              count: sql<number>`count(*)::int`,
              medianPerSqm: sql<number>`percentile_cont(0.5) within group (order by ${properties.price}::numeric / nullif(${properties.totalArea}, 0))`,
            })
            .from(properties)
            .where(
              and(
                eq(properties.status, "active"),
                eq(properties.currency, "USD"),
                gt(properties.totalArea, 0),
                // Residential only: a hectare of land or an A-class office would
                // make "price per m²" meaningless for a city.
                inArray(properties.type, ["apartment", "house"]),
              ),
            )
            .groupBy(properties.city, properties.dealType);

          const byCity = new Map<
            string,
            {
              city: string;
              salePerSqm: number | null;
              saleCount: number;
              rentPerSqm: number | null;
              rentCount: number;
              yieldPct: number | null;
            }
          >();
          for (const r of rows) {
            const entry = byCity.get(r.city) ?? {
              city: r.city,
              salePerSqm: null,
              saleCount: 0,
              rentPerSqm: null,
              rentCount: 0,
              yieldPct: null,
            };
            const value = r.medianPerSqm === null ? null : Math.round(Number(r.medianPerSqm));
            if (r.dealType === "sale") {
              entry.salePerSqm = value;
              entry.saleCount = Number(r.count);
            } else {
              entry.rentPerSqm = value;
              entry.rentCount = Number(r.count);
            }
            byCity.set(r.city, entry);
          }
          for (const entry of byCity.values()) {
            if (entry.salePerSqm && entry.rentPerSqm) {
              entry.yieldPct = Math.round(((entry.rentPerSqm * 12) / entry.salePerSqm) * 1000) / 10;
            }
          }

          const cities = [...byCity.values()].sort(
            (a, b) => b.saleCount + b.rentCount - (a.saleCount + a.rentCount),
          );

          return json(
            { success: true, cities, computedAt: new Date().toISOString() },
            { headers: { "cache-control": "public, max-age=300, stale-while-revalidate=3600" } },
          );
        } catch (error) {
          return errorResponse(error, "Failed to compute market prices");
        }
      },
    },
  },
});
