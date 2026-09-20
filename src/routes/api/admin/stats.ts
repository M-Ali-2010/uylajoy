import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { desc, eq, gte, sql } from "drizzle-orm";
import { adminActions, analyticsEvents, db, leads, properties, users, viewingRequests } from "@/db";
import { getCurrentUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/http";

/**
 * Everything the admin overview shows.
 *
 * Queries run sequentially on purpose: the function sits next to the
 * database (dub1 ↔ eu-west-1) so seven small queries cost ~30 ms, whereas a
 * Promise.all over the 3-connection pooler pool hung indefinitely on Vercel.
 */
export const Route = createFileRoute("/api/admin/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const admin = await getCurrentUser(request);
          if (!admin || admin.role !== "admin") {
            return json({ success: false, error: "Forbidden" }, { status: 403 });
          }

          const weekAgo = new Date(Date.now() - 7 * 86_400_000);
          // Inside raw sql`` drizzle does not map Date params for postgres-js —
          // pass ISO text and cast, or the driver throws ERR_INVALID_ARG_TYPE.
          const weekAgoIso = weekAgo.toISOString();

          const byStatus = await db
            .select({ status: properties.status, count: sql<number>`count(*)::int` })
            .from(properties)
            .groupBy(properties.status);

          const [userTotals] = await db
            .select({
              total: sql<number>`count(*)::int`,
              week: sql<number>`count(*) filter (where ${users.createdAt} >= ${weekAgoIso}::timestamp)::int`,
              blocked: sql<number>`count(*) filter (where ${users.isActive} = false)::int`,
            })
            .from(users);

          const [leadTotals] = await db
            .select({
              total: sql<number>`count(*)::int`,
              week: sql<number>`count(*) filter (where ${leads.createdAt} >= ${weekAgoIso}::timestamp)::int`,
              open: sql<number>`count(*) filter (where ${leads.status} = 'new')::int`,
            })
            .from(leads);

          const [viewingTotals] = await db
            .select({
              total: sql<number>`count(*)::int`,
              open: sql<number>`count(*) filter (where ${viewingRequests.status} = 'new')::int`,
            })
            .from(viewingRequests);

          const events = await db
            .select({ type: analyticsEvents.type, count: sql<number>`count(*)::int` })
            .from(analyticsEvents)
            .where(gte(analyticsEvents.createdAt, weekAgo))
            .groupBy(analyticsEvents.type);

          const recentActions = await db
            .select({
              id: adminActions.id,
              action: adminActions.action,
              targetType: adminActions.targetType,
              targetId: adminActions.targetId,
              reason: adminActions.reason,
              createdAt: adminActions.createdAt,
              adminName: users.name,
            })
            .from(adminActions)
            .leftJoin(users, eq(adminActions.adminId, users.id))
            .orderBy(desc(adminActions.createdAt))
            .limit(15);

          const recentUsers = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              createdAt: users.createdAt,
            })
            .from(users)
            .orderBy(desc(users.createdAt))
            .limit(6);

          return json({
            success: true,
            listings: Object.fromEntries(byStatus.map((r) => [r.status, Number(r.count)])),
            users: {
              total: Number(userTotals?.total ?? 0),
              week: Number(userTotals?.week ?? 0),
              blocked: Number(userTotals?.blocked ?? 0),
            },
            leads: {
              total: Number(leadTotals?.total ?? 0),
              week: Number(leadTotals?.week ?? 0),
              open: Number(leadTotals?.open ?? 0),
            },
            viewings: {
              total: Number(viewingTotals?.total ?? 0),
              open: Number(viewingTotals?.open ?? 0),
            },
            eventsWeek: Object.fromEntries(events.map((r) => [r.type, Number(r.count)])),
            recentActions,
            recentUsers,
          });
        } catch (error) {
          return errorResponse(error, "Failed to fetch admin stats");
        }
      },
    },
  },
});
