import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getProperties, approveProperty, rejectProperty } from "@/lib/server/properties";
import { notifyListingApproved, notifyListingRejected } from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/auth";
import { db, properties } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export const APIRoute = createAPIFileRoute("/api/admin/properties")({
  // Get pending properties for moderation
  GET: async ({ request }) => {
    try {
      const user = await getCurrentUser(request);

      if (!user || user.role !== "admin") {
        return json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 403 }
        );
      }

      const url = new URL(request.url);
      const status = url.searchParams.get("status") || "pending";
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);

      const result = await getProperties({
        status: status as "pending" | "active" | "rejected",
        page,
        limit,
        sortBy: "newest",
      });

      return json({
        success: true,
        ...result,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to fetch properties",
        },
        { status: 500 }
      );
    }
  },

  // Approve property
  POST: async ({ request }) => {
    try {
      const user = await getCurrentUser(request);

      if (!user || user.role !== "admin") {
        return json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 403 }
        );
      }

      const url = new URL(request.url);
      const propertyId = url.searchParams.get("id");
      const action = url.searchParams.get("action");

      if (!propertyId) {
        return json(
          {
            success: false,
            error: "Property ID is required",
          },
          { status: 400 }
        );
      }

      // Get property info
      const [property] = await db
        .select({ id: properties.id, title: properties.title, ownerId: properties.ownerId })
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);

      if (!property) {
        return json(
          {
            success: false,
            error: "Property not found",
          },
          { status: 404 }
        );
      }

      if (action === "approve") {
        await approveProperty(propertyId);

        // Notify owner
        await notifyListingApproved(property.ownerId, property.title, property.id);

        return json({
          success: true,
          message: "Property approved successfully",
        });
      }

      if (action === "reject") {
        const body = await request.json();
        const validated = rejectSchema.parse(body);

        await rejectProperty(propertyId, validated.reason);

        // Notify owner
        await notifyListingRejected(property.ownerId, property.title, validated.reason);

        return json({
          success: true,
          message: "Property rejected",
        });
      }

      return json(
        {
          success: false,
          error: "Invalid action. Use 'approve' or 'reject'",
        },
        { status: 400 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json(
          {
            success: false,
            error: "Validation failed",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      const message = error instanceof Error ? error.message : "Failed to process request";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 500 }
      );
    }
  },
});
