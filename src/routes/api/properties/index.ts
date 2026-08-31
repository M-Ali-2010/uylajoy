import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getProperties, createProperty } from "@/lib/server/properties";
import { getCurrentUser } from "@/lib/server/auth";
import { z } from "zod";

const filtersSchema = z.object({
  type: z.enum(["apartment", "house", "office", "land", "commercial"]).optional(),
  dealType: z.enum(["sale", "rent"]).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRooms: z.coerce.number().optional(),
  maxRooms: z.coerce.number().optional(),
  minArea: z.coerce.number().optional(),
  maxArea: z.coerce.number().optional(),
  condition: z.enum(["new", "renovated", "good", "needs_repair"]).optional(),
  status: z.enum(["draft", "pending", "active", "sold", "rented", "paused", "rejected", "archived"]).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isPremium: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest", "oldest", "popular"]).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const createPropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["apartment", "house", "office", "land", "commercial"]),
  dealType: z.enum(["sale", "rent"]),
  price: z.number().positive("Price must be positive"),
  currency: z.enum(["USD", "UZS", "EUR"]).optional(),
  city: z.string().min(2),
  district: z.string().min(2),
  address: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rooms: z.number().int().min(0).optional(),
  totalArea: z.number().positive("Area must be positive"),
  livingArea: z.number().positive().optional(),
  floor: z.number().int().positive().optional(),
  totalFloors: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  condition: z.enum(["new", "renovated", "good", "needs_repair"]).optional(),
  amenities: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        order: z.number().int(),
        isCover: z.boolean(),
      })
    )
    .optional(),
  agentId: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
});

export const APIRoute = createAPIFileRoute("/api/properties")({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams);
      const filters = filtersSchema.parse(params);

      const result = await getProperties(filters);

      return json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json(
          {
            success: false,
            error: "Invalid filters",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      return json(
        {
          success: false,
          error: "Failed to fetch properties",
        },
        { status: 500 }
      );
    }
  },

  POST: async ({ request }) => {
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
      const validated = createPropertySchema.parse(body);

      const property = await createProperty({
        ...validated,
        ownerId: user.id,
      });

      return json(
        {
          success: true,
          property,
        },
        { status: 201 }
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

      const message = error instanceof Error ? error.message : "Failed to create property";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }
  },
});
