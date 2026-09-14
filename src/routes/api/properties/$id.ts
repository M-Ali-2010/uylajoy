import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server/auth";
import { errorResponse, readJson } from "@/lib/server/http";
import {
  deleteProperty,
  getPropertyById,
  getSimilarProperties,
  updateProperty,
} from "@/lib/server/properties";

const currentYear = new Date().getFullYear();

/**
 * What an owner may change. Moderation state, paid flags and rejection reason
 * are deliberately absent — those have admin endpoints. `status` is limited to
 * the transitions the service allows an owner (archive, pause, resubmit).
 */
const updatePropertySchema = z
  .object({
    title: z.string().trim().min(5).max(140),
    description: z.string().trim().min(20).max(5000),
    type: z.enum(["apartment", "house", "office", "land", "commercial"]),
    dealType: z.enum(["sale", "rent"]),
    price: z.number().int().positive().max(1_000_000_000),
    currency: z.enum(["USD", "UZS", "EUR"]),
    city: z.string().trim().min(2).max(80),
    district: z.string().trim().min(2).max(80),
    address: z.string().trim().min(5).max(200),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    rooms: z.number().int().min(0).max(50),
    totalArea: z.number().positive().max(100_000),
    livingArea: z.number().positive().max(100_000),
    floor: z.number().int().min(0).max(200),
    totalFloors: z.number().int().min(1).max(200),
    yearBuilt: z
      .number()
      .int()
      .min(1800)
      .max(currentYear + 3),
    condition: z.enum(["new", "renovated", "good", "needs_repair"]),
    amenities: z.array(z.string().trim().min(1).max(60)).max(40),
    status: z.enum(["draft", "pending", "paused", "archived", "sold", "rented"]),
  })
  .partial()
  .strict();

const idSchema = z.string().uuid("Invalid property id");

export const Route = createFileRoute("/api/properties/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const id = idSchema.parse(params.id);
          const viewer = await getCurrentUser(request);

          const property = await getPropertyById(id, true, viewer);
          if (!property) {
            return json({ success: false, error: "Property not found" }, { status: 404 });
          }

          const similar = await getSimilarProperties(id, 4);
          return json({ success: true, property, similar });
        } catch (error) {
          return errorResponse(error, "Failed to fetch property");
        }
      },

      PATCH: async ({ request, params }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user) return json({ success: false, error: "Unauthorized" }, { status: 401 });

          const id = idSchema.parse(params.id);
          const validated = updatePropertySchema.parse(await readJson(request));

          const property = await updateProperty(id, validated, user.id);
          return json({ success: true, property });
        } catch (error) {
          return errorResponse(error, "Failed to update property");
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user) return json({ success: false, error: "Unauthorized" }, { status: 401 });

          const id = idSchema.parse(params.id);
          await deleteProperty(id, user.id);
          return json({ success: true });
        } catch (error) {
          return errorResponse(error, "Failed to delete property");
        }
      },
    },
  },
});
