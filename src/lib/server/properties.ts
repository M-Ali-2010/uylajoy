import { eq, and, or, gte, lte, ilike, desc, asc, sql, inArray } from "drizzle-orm";
import { db, properties, propertyImages, users, agents, agencies, priceHistory } from "@/db";
import { AppError, forbidden, notFound } from "./errors";

export type PropertyStatus =
  "draft" | "pending" | "active" | "sold" | "rented" | "paused" | "rejected" | "archived";

/** Status transitions an owner may request on their own listing. */
const OWNER_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  draft: ["pending", "archived"],
  pending: ["draft", "archived"],
  active: ["paused", "archived", "sold", "rented"],
  paused: ["pending", "archived"],
  rejected: ["pending", "archived"],
  sold: ["archived"],
  rented: ["archived"],
  archived: ["pending"],
};

/** Statuses visible to anyone. Everything else is only for owner + admin. */
export const PUBLIC_STATUSES: PropertyStatus[] = ["active"];

/** Fields whose change on a published listing sends it back to moderation. */
const MODERATED_FIELDS = [
  "title",
  "description",
  "type",
  "dealType",
  "price",
  "currency",
  "city",
  "district",
  "address",
  "rooms",
  "totalArea",
  "livingArea",
  "floor",
  "totalFloors",
  "yearBuilt",
  "condition",
  "amenities",
] as const;

/** Escape LIKE metacharacters so a search for "50%" means fifty percent. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (m) => `\\${m}`);

/** Strip owner contact details for everyone but the owner and admins. */
export function toPublicProperty<T extends { owner?: { phone?: string | null } | null }>(
  property: T,
  viewer?: { id: string; role: string } | null,
  ownerId?: string,
): T {
  const privileged = viewer && (viewer.role === "admin" || viewer.id === ownerId);
  if (privileged || !property.owner) return property;
  const { phone: _phone, ...owner } = property.owner;
  return { ...property, owner } as T;
}

// Types
export interface PropertyFilters {
  type?: "apartment" | "house" | "office" | "land" | "commercial" | undefined;
  dealType?: "sale" | "rent" | undefined;
  city?: string | undefined;
  district?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minRooms?: number | undefined;
  maxRooms?: number | undefined;
  minArea?: number | undefined;
  maxArea?: number | undefined;
  condition?: "new" | "renovated" | "good" | "needs_repair" | undefined;
  amenities?: string[] | undefined;
  status?:
    | "draft"
    | "pending"
    | "active"
    | "sold"
    | "rented"
    | "paused"
    | "rejected"
    | "archived"
    | undefined;
  isFeatured?: boolean | undefined;
  isPremium?: boolean | undefined;
  ownerId?: string | undefined;
  agentId?: string | undefined;
  agencyId?: string | undefined;
  search?: string | undefined;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "popular" | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export const MAX_PAGE_SIZE = 50;

export interface CreatePropertyInput {
  title: string;
  description: string;
  type: "apartment" | "house" | "office" | "land" | "commercial";
  dealType: "sale" | "rent";
  price: number;
  currency?: "USD" | "UZS" | "EUR" | undefined;
  city: string;
  district: string;
  address: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
  rooms?: number | undefined;
  totalArea: number;
  livingArea?: number | undefined;
  floor?: number | undefined;
  totalFloors?: number | undefined;
  yearBuilt?: number | undefined;
  condition?: "new" | "renovated" | "good" | "needs_repair" | undefined;
  amenities?: string[] | undefined;
  images?: { url: string; order: number; isCover: boolean }[] | undefined;
  ownerId: string;
  agentId?: string | undefined;
  agencyId?: string | undefined;
}

export interface UpdatePropertyInput {
  title?: string | undefined;
  description?: string | undefined;
  type?: "apartment" | "house" | "office" | "land" | "commercial" | undefined;
  dealType?: "sale" | "rent" | undefined;
  price?: number | undefined;
  currency?: "USD" | "UZS" | "EUR" | undefined;
  city?: string | undefined;
  district?: string | undefined;
  address?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  rooms?: number | undefined;
  totalArea?: number | undefined;
  livingArea?: number | undefined;
  floor?: number | undefined;
  totalFloors?: number | undefined;
  yearBuilt?: number | undefined;
  condition?: "new" | "renovated" | "good" | "needs_repair" | undefined;
  amenities?: string[] | undefined;
  status?: "draft" | "pending" | "active" | "paused" | "archived" | undefined;
  rejectionReason?: string | undefined;
  isFeatured?: boolean | undefined;
  isPremium?: boolean | undefined;
  featuredUntil?: Date | undefined;
  premiumUntil?: Date | undefined;
}

// Get properties with filters
export async function getProperties(filters: PropertyFilters = {}) {
  const {
    type,
    dealType,
    city,
    district,
    minPrice,
    maxPrice,
    minRooms,
    maxRooms,
    minArea,
    maxArea,
    condition,
    amenities,
    status = "active",
    isFeatured,
    isPremium,
    ownerId,
    agentId,
    agencyId,
    search,
    sortBy = "newest",
    page = 1,
    limit = 20,
  } = filters;

  const conditions = [];

  // Status filter
  if (status) {
    conditions.push(eq(properties.status, status));
  }

  // Type filters
  if (type) {
    conditions.push(eq(properties.type, type));
  }
  if (dealType) {
    conditions.push(eq(properties.dealType, dealType));
  }

  // Location filters
  if (city) {
    conditions.push(eq(properties.city, city));
  }
  if (district) {
    conditions.push(eq(properties.district, district));
  }

  // Price filters
  if (minPrice !== undefined) {
    conditions.push(gte(properties.price, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(properties.price, maxPrice));
  }

  // Room filters
  if (minRooms !== undefined) {
    conditions.push(gte(properties.rooms, minRooms));
  }
  if (maxRooms !== undefined) {
    conditions.push(lte(properties.rooms, maxRooms));
  }

  // Area filters
  if (minArea !== undefined) {
    conditions.push(gte(properties.totalArea, minArea));
  }
  if (maxArea !== undefined) {
    conditions.push(lte(properties.totalArea, maxArea));
  }

  // Condition filter
  if (condition) {
    conditions.push(eq(properties.condition, condition));
  }

  // Featured/Premium filters
  if (isFeatured !== undefined) {
    conditions.push(eq(properties.isFeatured, isFeatured));
  }
  if (isPremium !== undefined) {
    conditions.push(eq(properties.isPremium, isPremium));
  }

  // Owner filters
  if (ownerId) {
    conditions.push(eq(properties.ownerId, ownerId));
  }
  if (agentId) {
    conditions.push(eq(properties.agentId, agentId));
  }
  if (agencyId) {
    conditions.push(eq(properties.agencyId, agencyId));
  }

  // Search filter — case-insensitive, metacharacters escaped
  if (search) {
    const pattern = `%${escapeLike(search.trim())}%`;
    conditions.push(
      or(
        ilike(properties.title, pattern),
        ilike(properties.description, pattern),
        ilike(properties.address, pattern),
        ilike(properties.district, pattern),
      ),
    );
  }

  // Sorting
  let orderBy;
  switch (sortBy) {
    case "price_asc":
      orderBy = asc(properties.price);
      break;
    case "price_desc":
      orderBy = desc(properties.price);
      break;
    case "oldest":
      orderBy = asc(properties.createdAt);
      break;
    case "popular":
      orderBy = desc(properties.viewCount);
      break;
    case "newest":
    default:
      orderBy = desc(properties.createdAt);
  }

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(countResult?.count || 0);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  // Get properties with related data
  const result = await db
    .select({
      property: properties,
      owner: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(properties)
    .leftJoin(users, eq(properties.ownerId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(safeLimit)
    .offset(offset);

  // Get images for all properties
  const propertyIds = result.map((r) => r.property.id);
  const images =
    propertyIds.length > 0
      ? await db
          .select()
          .from(propertyImages)
          .where(inArray(propertyImages.propertyId, propertyIds))
          .orderBy(propertyImages.order)
      : [];

  // Map images to properties
  const propertiesWithImages = result.map((r) => ({
    ...r.property,
    owner: r.owner,
    images: images.filter((img) => img.propertyId === r.property.id),
  }));

  return {
    properties: propertiesWithImages,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

// Get single property by ID.
// Unpublished listings resolve to "not found" for anyone but the owner or an
// admin, so a guessed UUID reveals nothing.
export async function getPropertyById(
  id: string,
  incrementView = false,
  viewer?: { id: string; role: string } | null,
) {
  const [result] = await db
    .select({
      property: properties,
      owner: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        phone: users.phone,
      },
    })
    .from(properties)
    .leftJoin(users, eq(properties.ownerId, users.id))
    .where(eq(properties.id, id))
    .limit(1);

  if (!result) {
    return null;
  }

  const isPrivileged = viewer && (viewer.role === "admin" || viewer.id === result.property.ownerId);
  if (!PUBLIC_STATUSES.includes(result.property.status) && !isPrivileged) {
    return null;
  }

  // Increment view count if requested (never for the owner looking at their own)
  if (incrementView && !isPrivileged) {
    await db
      .update(properties)
      .set({ viewCount: sql`${properties.viewCount} + 1` })
      .where(eq(properties.id, id));
  }

  // Get images
  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(propertyImages.order);

  // Get agent if assigned
  let agent = null;
  if (result.property.agentId) {
    const [agentResult] = await db
      .select({
        agent: agents,
        user: {
          name: users.name,
          avatar: users.avatar,
          phone: users.phone,
        },
      })
      .from(agents)
      .leftJoin(users, eq(agents.userId, users.id))
      .where(eq(agents.id, result.property.agentId))
      .limit(1);

    if (agentResult) {
      agent = {
        ...agentResult.agent,
        ...agentResult.user,
      };
    }
  }

  // Get agency if assigned
  let agency = null;
  if (result.property.agencyId) {
    const [agencyResult] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, result.property.agencyId))
      .limit(1);

    agency = agencyResult || null;
  }

  // Get price history
  const priceHistoryData = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.propertyId, id))
    .orderBy(desc(priceHistory.changedAt));

  return toPublicProperty(
    {
      ...result.property,
      owner: result.owner,
      images,
      agent,
      agency,
      priceHistory: priceHistoryData,
    },
    viewer,
    result.property.ownerId,
  );
}

// Create property
export async function createProperty(input: CreatePropertyInput) {
  const { images, ...propertyData } = input;

  // Create property
  const [newProperty] = await db
    .insert(properties)
    .values({
      ...propertyData,
      rooms: propertyData.rooms || 0,
      amenities: propertyData.amenities || [],
      status: "pending", // Start as pending for moderation
    })
    .returning();

  if (!newProperty) throw new AppError(500, "Failed to create property");

  // Create images if provided
  if (images && images.length > 0) {
    await db.insert(propertyImages).values(
      images.map((img) => ({
        propertyId: newProperty.id,
        url: img.url,
        order: img.order,
        isCover: img.isCover,
      })),
    );
  }

  return getPropertyById(newProperty.id, false, { id: input.ownerId, role: "owner" });
}

// Update property (owner path).
// Paid flags, moderation fields and arbitrary statuses are not accepted here —
// admins have their own functions. Editing the content of a published listing
// puts it back into the moderation queue.
export type OwnerUpdateInput = Partial<
  Pick<UpdatePropertyInput, (typeof MODERATED_FIELDS)[number] | "latitude" | "longitude">
> & { status?: PropertyStatus | undefined };

export async function updateProperty(id: string, input: OwnerUpdateInput, userId: string) {
  const [existing] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);

  if (!existing) throw notFound("Property");
  if (existing.ownerId !== userId) throw forbidden("Not authorized to update this property");

  const { status: requestedStatus, ...fields } = input;

  // Only whitelisted content fields, and only the ones actually present
  const changes: Record<string, unknown> = {};
  for (const key of [...MODERATED_FIELDS, "latitude", "longitude"] as const) {
    const value = (fields as Record<string, unknown>)[key];
    if (value !== undefined && value !== (existing as Record<string, unknown>)[key]) {
      changes[key] = value;
    }
  }

  let nextStatus: PropertyStatus = existing.status;

  if (requestedStatus && requestedStatus !== existing.status) {
    const allowed = OWNER_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(requestedStatus)) {
      throw new AppError(
        400,
        `Cannot change status from "${existing.status}" to "${requestedStatus}"`,
      );
    }
    nextStatus = requestedStatus;
  }

  const touchedModerated = MODERATED_FIELDS.some((key) => key in changes);
  if (touchedModerated && (existing.status === "active" || existing.status === "paused")) {
    nextStatus = "pending";
  }
  if (touchedModerated && existing.status === "rejected") {
    nextStatus = "pending";
    changes["rejectionReason"] = null;
  }

  if (Object.keys(changes).length === 0 && nextStatus === existing.status) {
    return getPropertyById(id, false, { id: userId, role: "owner" });
  }

  // Track price change
  if (typeof changes["price"] === "number" && changes["price"] !== existing.price) {
    await db.insert(priceHistory).values({
      propertyId: id,
      previousPrice: existing.price,
      newPrice: changes["price"],
      currency: (changes["currency"] as string | undefined) ?? existing.currency,
    });
  }

  await db
    .update(properties)
    .set({ ...changes, status: nextStatus, updatedAt: new Date() })
    .where(eq(properties.id, id));

  return getPropertyById(id, false, { id: userId, role: "owner" });
}

// Delete property
export async function deleteProperty(id: string, userId: string) {
  const [existing] = await db
    .select({ ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) throw notFound("Property");
  if (existing.ownerId !== userId) throw forbidden("Not authorized to delete this property");

  await db.delete(properties).where(eq(properties.id, id));
}

// Update property images
export async function updatePropertyImages(
  propertyId: string,
  images: { url: string; order: number; isCover: boolean }[],
  userId: string,
) {
  // Check ownership
  const [existing] = await db
    .select({ ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!existing) throw notFound("Property");
  if (existing.ownerId !== userId) throw forbidden("Not authorized to update this property");

  // Delete existing images
  await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));

  // Insert new images
  if (images.length > 0) {
    await db.insert(propertyImages).values(
      images.map((img) => ({
        propertyId,
        url: img.url,
        order: img.order,
        isCover: img.isCover,
      })),
    );
  }

  return getPropertyById(propertyId, false, { id: userId, role: "owner" });
}

// Admin: Approve property — only something waiting for moderation can be approved
export async function approveProperty(id: string) {
  const [updated] = await db
    .update(properties)
    .set({
      status: "active",
      rejectionReason: null,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(properties.id, id), eq(properties.status, "pending")))
    .returning();

  if (!updated) throw new AppError(409, "Only listings pending moderation can be approved");
  return updated;
}

// Admin: Reject property
export async function rejectProperty(id: string, reason: string) {
  const [updated] = await db
    .update(properties)
    .set({
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(and(eq(properties.id, id), eq(properties.status, "pending")))
    .returning();

  if (!updated) throw new AppError(409, "Only listings pending moderation can be rejected");
  return updated;
}

// Admin: Archive property (takes it off the site regardless of state)
export async function archivePropertyAsAdmin(id: string) {
  const [updated] = await db
    .update(properties)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(properties.id, id))
    .returning();

  if (!updated) throw notFound("Property");
  return updated;
}

// Get featured/premium properties
export async function getFeaturedProperties(limit = 6) {
  const now = new Date();
  const safeLimit = Math.min(Math.max(1, limit), 24);

  const result = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.status, "active"),
        eq(properties.isFeatured, true),
        or(sql`${properties.featuredUntil} IS NULL`, gte(properties.featuredUntil, now)),
      ),
    )
    .orderBy(desc(properties.createdAt))
    .limit(safeLimit);

  const propertyIds = result.map((r) => r.id);
  const images =
    propertyIds.length > 0
      ? await db
          .select()
          .from(propertyImages)
          .where(inArray(propertyImages.propertyId, propertyIds))
      : [];

  return result.map((p) => ({
    ...p,
    images: images.filter((img) => img.propertyId === p.id),
  }));
}

// Get similar properties
export async function getSimilarProperties(propertyId: string, limit = 4) {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!property) {
    return [];
  }

  const result = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.status, "active"),
        eq(properties.type, property.type),
        eq(properties.dealType, property.dealType),
        eq(properties.city, property.city),
        sql`${properties.id} != ${propertyId}`,
      ),
    )
    .orderBy(sql`ABS(${properties.price} - ${property.price})`)
    .limit(limit);

  const propertyIds = result.map((r) => r.id);
  const images =
    propertyIds.length > 0
      ? await db
          .select()
          .from(propertyImages)
          .where(inArray(propertyImages.propertyId, propertyIds))
      : [];

  return result.map((p) => ({
    ...p,
    images: images.filter((img) => img.propertyId === p.id),
  }));
}
