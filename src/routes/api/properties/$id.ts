import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getPropertyById, updateProperty, deleteProperty, getSimilarProperties } from "@/lib/server/properties";
import { getCurrentUser } from "@/lib/server/auth";
import { z } from "zod";

const updatePropertySchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  type: z.enum(["apartment", "house", "office", "land", "commercial"]).optional(),
  dealType: z.enum(["sale", "rent"]).optional(),
  price: z.number().positive().optional(),
  currency: z.enum(["USD", "UZS", "EUR"]).optional(),
  city: z.string().min(2).optional(),
  district: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rooms: z.number().int().min(0).optional(),
  totalArea: z.number().positive().optional(),
  livingArea: z.number().positive().optional(),
  floor: z.number().int().positive().optional(),
  totalFloors: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  condition: z.enum(["new", "renovated", "good", "needs_repair"]).optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["draft", "pending", "active", "paused", "archived"]).optional(),
});

export const APIRoute = createAPIFileRoute("/api/properties/$id")({
  GET: async ({ params }) => {
    try {
      const property = await getPropertyById(params.id, true); // Increment view count

      if (!property) {
        return json(
          {
            success: false,
            error: "Property not found",
          },
          { status: 404 }
        );
      }

      // Get similar properties
      const similar = await getSimilarProperties(params.id, 4);

      return json({
        success: true,
        property,
        similar,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to fetch property",
        },
        { status: 500 }
      );
    }
  },

  PATCH: async ({ request, params }) => {
    try {
      const user = await getCurrentUser(request);

      if (!user) {
        return json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 401 }
        );
      }

      const body = await request.json();
      const validated = updatePropertySchema.parse(body);

      const property = await updateProperty(params.id, validated, user.id);

      return json({
        success: true,
        property,
      });
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

      const message = error instanceof Error ? error.message : "Failed to update property";
      const status = message.includes("Not authorized") ? 403 : message.includes("not found") ? 404 : 400;

      return json(
        {
          success: false,
          error: message,
        },
        { status }
      );
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const user = await getCurrentUser(request);

      if (!user) {
        return json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 401 }
        );
      }

      await deleteProperty(params.id, user.id);

      return json({
        success: true,
        message: "Property deleted successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete property";
      const status = message.includes("Not authorized") ? 403 : message.includes("not found") ? 404 : 400;

      return json(
        {
          success: false,
          error: message,
        },
        { status }
      );
    }
  },
});
