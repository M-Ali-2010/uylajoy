import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { adminActions, db, properties, users } from "@/db";
import { deleteAllUserSessions, getCurrentUser } from "@/lib/server/auth";
import { clampInt, clientIp, errorResponse, readJson } from "@/lib/server/http";

const actionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["block", "unblock"]),
  reason: z.string().trim().max(1000).optional(),
});

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const admin = await getCurrentUser(request);
          if (!admin || admin.role !== "admin") {
            return json({ success: false, error: "Forbidden" }, { status: 403 });
          }

          const url = new URL(request.url);
          const search = url.searchParams.get("search")?.trim();
          const page = clampInt(url.searchParams.get("page"), {
            min: 1,
            max: 100_000,
            fallback: 1,
          });
          const limit = clampInt(url.searchParams.get("limit"), { min: 1, max: 50, fallback: 20 });

          const where = search
            ? or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`))
            : undefined;

          const [rows, [count]] = await Promise.all([
            db
              .select({
                id: users.id,
                email: users.email,
                name: users.name,
                phone: users.phone,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
              })
              .from(users)
              .where(where)
              .orderBy(desc(users.createdAt))
              .limit(limit)
              .offset((page - 1) * limit),
            db
              .select({ total: sql<number>`count(*)::int` })
              .from(users)
              .where(where),
          ]);

          // Listing counts for just this page of users
          const ids = rows.map((r) => r.id);
          const counts = ids.length
            ? await db
                .select({ ownerId: properties.ownerId, n: sql<number>`count(*)::int` })
                .from(properties)
                .where(inArray(properties.ownerId, ids))
                .groupBy(properties.ownerId)
            : [];
          const byOwner = new Map(counts.map((c) => [c.ownerId, Number(c.n)]));

          return json({
            success: true,
            users: rows.map((r) => ({ ...r, listings: byOwner.get(r.id) ?? 0 })),
            pagination: { page, limit, total: count?.total ?? 0 },
          });
        } catch (error) {
          return errorResponse(error, "Failed to fetch users");
        }
      },

      POST: async ({ request }) => {
        try {
          const admin = await getCurrentUser(request);
          if (!admin || admin.role !== "admin") {
            return json({ success: false, error: "Forbidden" }, { status: 403 });
          }

          const input = actionSchema.parse(await readJson(request));
          if (input.userId === admin.id) {
            return json({ success: false, error: "You cannot block yourself" }, { status: 400 });
          }

          const [target] = await db
            .select({ id: users.id, role: users.role })
            .from(users)
            .where(eq(users.id, input.userId))
            .limit(1);
          if (!target) return json({ success: false, error: "User not found" }, { status: 404 });
          if (target.role === "admin") {
            return json(
              { success: false, error: "Admins cannot be blocked here" },
              { status: 400 },
            );
          }

          const isActive = input.action === "unblock";
          await db
            .update(users)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(users.id, target.id));
          if (!isActive) await deleteAllUserSessions(target.id);

          await db.insert(adminActions).values({
            adminId: admin.id,
            action: `user.${input.action}`,
            targetType: "user",
            targetId: target.id,
            reason: input.reason ?? null,
            ip: clientIp(request),
          });

          return json({ success: true });
        } catch (error) {
          return errorResponse(error, "Failed to update user");
        }
      },
    },
  },
});
