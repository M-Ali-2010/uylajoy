import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { agents, db } from "@/db";
import { getCurrentUser } from "@/lib/server/auth";
import { clampInt, clientIp, errorResponse, readJson } from "@/lib/server/http";
import { getProperties, createProperty, MAX_PAGE_SIZE } from "@/lib/server/properties";
import { RULES, rateLimit } from "@/lib/server/rate-limit";

const filtersSchema = z.object({
  type: z.enum(["apartment", "house", "office", "land", "commercial"]).optional(),
  dealType: z.enum(["sale", "rent"]).optional(),
  city: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRooms: z.coerce.number().int().min(0).optional(),
  maxRooms: z.coerce.number().int().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  condition: z.enum(["new", "renovated", "good", "needs_repair"]).optional(),
  search: z.string().max(120).optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest", "oldest", "popular"]).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  /**
   * `mine=1` switches the list to the caller's own listings in any status —
   * the only way a non-admin can see something other than published ones.
   */
  mine: z.enum(["1", "true"]).optional(),
  status: z
    .enum(["draft", "pending", "active", "sold", "rented", "paused", "rejected", "archived"])
    .optional(),
});

const currentYear = new Date().getFullYear();

const createPropertySchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(140),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000),
  type: z.enum(["apartment", "house", "office", "land", "commercial"]),
  dealType: z.enum(["sale", "rent"]),
  price: z.number().int().positive("Price must be positive").max(1_000_000_000),
  currency: z.enum(["USD", "UZS", "EUR"]).optional(),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  rooms: z.number().int().min(0).max(50).optional(),
  totalArea: z.number().positive("Area must be positive").max(100_000),
  livingArea: z.number().positive().max(100_000).optional(),
  floor: z.number().int().min(0).max(200).optional(),
  totalFloors: z.number().int().min(1).max(200).optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(currentYear + 3)
    .optional(),
  condition: z.enum(["new", "renovated", "good", "needs_repair"]).optional(),
  amenities: z.array(z.string().trim().min(1).max(60)).max(40).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url().max(500),
        order: z.number().int().min(0).max(40),
        isCover: z.boolean(),
      }),
    )
    .max(40)
    .optional(),
});

export const Route = createFileRoute("/api/properties/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const { mine, status, page, limit, ...filters } = filtersSchema.parse(
            Object.fromEntries(url.searchParams),
          );

          const viewer = await getCurrentUser(request);

          // Anonymous and ordinary users only ever see published listings.
          // Owners get their own (any status) via `mine`; admins may filter freely.
          let scope: { status?: typeof status; ownerId?: string } = { status: "active" };
          if (mine && viewer) {
            scope = { ownerId: viewer.id, ...(status ? { status } : {}) };
          } else if (viewer?.role === "admin" && status) {
            scope = { status };
          }

          const result = await getProperties({
            ...filters,
            ...scope,
            page: clampInt(page, { min: 1, max: 100_000, fallback: 1 }),
            limit: clampInt(limit, { min: 1, max: MAX_PAGE_SIZE, fallback: 20 }),
          });

          return json({ success: true, ...result });
        } catch (error) {
          return errorResponse(error, "Failed to fetch properties");
        }
      },

      POST: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user) return json({ success: false, error: "Unauthorized" }, { status: 401 });

          rateLimit("create-listing", user.id, RULES.createListing);

          const validated = createPropertySchema.parse(await readJson(request));

          if (validated.floor !== undefined && validated.totalFloors !== undefined) {
            if (validated.floor > validated.totalFloors) {
              return json(
                { success: false, error: "Floor cannot be above the building's total floors" },
                { status: 400 },
              );
            }
          }

          // An agent's listings are attached to their own agent profile — never
          // to an id supplied by the client.
          let agentId: string | undefined;
          if (user.role === "agent") {
            const [agent] = await db
              .select({ id: agents.id, agencyId: agents.agencyId })
              .from(agents)
              .where(eq(agents.userId, user.id))
              .limit(1);
            agentId = agent?.id;
          }

          const property = await createProperty({
            ...validated,
            ownerId: user.id,
            agentId,
          });

          return json({ success: true, property }, { status: 201 });
        } catch (error) {
          return errorResponse(error, "Failed to create property");
        }
      },
    },
  },
});
