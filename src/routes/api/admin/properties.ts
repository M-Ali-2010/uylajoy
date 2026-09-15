import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminActions, db, properties } from "@/db";
import { getCurrentUser } from "@/lib/server/auth";
import { clampInt, clientIp, errorResponse, readJson } from "@/lib/server/http";
import { notifyListingApproved, notifyListingRejected } from "@/lib/server/notifications";
import {
  MAX_PAGE_SIZE,
  approveProperty,
  archivePropertyAsAdmin,
  getProperties,
  rejectProperty,
} from "@/lib/server/properties";

const statusSchema = z.enum([
  "draft",
  "pending",
  "active",
  "sold",
  "rented",
  "paused",
  "rejected",
  "archived",
]);

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), propertyId: z.string().uuid() }),
  z.object({
    action: z.literal("reject"),
    propertyId: z.string().uuid(),
    reason: z.string().trim().min(10, "Rejection reason must be at least 10 characters").max(1000),
  }),
  z.object({
    action: z.literal("archive"),
    propertyId: z.string().uuid(),
    reason: z.string().trim().max(1000).optional(),
  }),
]);

export const Route = createFileRoute("/api/admin/properties")({
  server: {
    handlers: {
      // Moderation queue (default) or any status the admin asks for
      GET: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user || user.role !== "admin") {
            return json({ success: false, error: "Forbidden" }, { status: 403 });
          }

          const url = new URL(request.url);
          const status = statusSchema
            .catch("pending")
            .parse(url.searchParams.get("status") ?? "pending");

          const result = await getProperties({
            status,
            page: clampInt(url.searchParams.get("page"), { min: 1, max: 100_000, fallback: 1 }),
            limit: clampInt(url.searchParams.get("limit"), {
              min: 1,
              max: MAX_PAGE_SIZE,
              fallback: 20,
            }),
            sortBy: "oldest", // moderate in the order they arrived
          });

          return json({ success: true, ...result });
        } catch (error) {
          return errorResponse(error, "Failed to fetch properties");
        }
      },

      // approve / reject / archive — every call is written to the admin action log
      POST: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user || user.role !== "admin") {
            return json({ success: false, error: "Forbidden" }, { status: 403 });
          }

          // Accept the JSON body; fall back to the legacy ?id=&action= form.
          const url = new URL(request.url);
          const raw = request.headers.get("content-type")?.includes("application/json")
            ? await readJson(request)
            : {
                propertyId: url.searchParams.get("id"),
                action: url.searchParams.get("action"),
                reason: url.searchParams.get("reason") ?? undefined,
              };
          const input = actionSchema.parse(raw);

          const [property] = await db
            .select({ id: properties.id, title: properties.title, ownerId: properties.ownerId })
            .from(properties)
            .where(eq(properties.id, input.propertyId))
            .limit(1);

          if (!property) {
            return json({ success: false, error: "Property not found" }, { status: 404 });
          }

          let message: string;
          if (input.action === "approve") {
            await approveProperty(property.id);
            await notifyListingApproved(property.ownerId, property.title, property.id);
            message = "Property approved";
          } else if (input.action === "reject") {
            await rejectProperty(property.id, input.reason);
            await notifyListingRejected(
              property.ownerId,
              property.title,
              input.reason,
              property.id,
            );
            message = "Property rejected";
          } else {
            await archivePropertyAsAdmin(property.id);
            message = "Property archived";
          }

          await db.insert(adminActions).values({
            adminId: user.id,
            action: `property.${input.action}`,
            targetType: "property",
            targetId: property.id,
            reason: "reason" in input ? (input.reason ?? null) : null,
            ip: clientIp(request),
          });

          return json({ success: true, message });
        } catch (error) {
          return errorResponse(error, "Failed to process request");
        }
      },
    },
  },
});
