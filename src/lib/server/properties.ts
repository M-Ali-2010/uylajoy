import { eq, and, or, gte, lte, like, desc, asc, sql, inArray } from "drizzle-orm";
import { db, properties, propertyImages, users, agents, agencies, favorites, priceHistory } from "@/db";

// Types
export interface PropertyFilters {
  type?: "apartment" | "house" | "office" | "land" | "commercial";
  dealType?: "sale" | "rent";
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  condition?: "new" | "renovated" | "good" | "needs_repair";
  amenities?: string[];
  status?: "draft" | "pending" | "active" | "sold" | "rented" | "paused" | "rejected" | "archived";
  isFeatured?: boolean;
  isPremium?: boolean;
  ownerId?: string;
  agentId?: string;
  agencyId?: string;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "popular";
  page?: number;
  limit?: number;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  type: "apartment" | "house" | "office" | "land" | "commercial";
  dealType: "sale" | "rent";
  price: number;
  currency?: "USD" | "UZS" | "EUR";
  city: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rooms?: number;
  totalArea: number;
  livingArea?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  condition?: "new" | "renovated" | "good" | "needs_repair";
  amenities?: string[];
  images?: { url: string; order: number; isCover: boolean }[];
  ownerId: string;
  agentId?: string;
  agencyId?: string;
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  type?: "apartment" | "house" | "office" | "land" | "commercial";
  dealType?: "sale" | "rent";
  price?: number;
  currency?: "USD" | "UZS" | "EUR";
  city?: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rooms?: number;
  totalArea?: number;
  livingArea?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  condition?: "new" | "renovated" | "good" | "needs_repair";
  amenities?: string[];
  status?: "draft" | "pending" | "active" | "paused" | "archived";
  rejectionReason?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  featuredUntil?: Date;
  premiumUntil?: Date;
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

  // Search filter
  if (search) {
    conditions.push(
      or(
        like(properties.title, `%${search}%`),
        like(properties.description, `%${search}%`),
        like(properties.address, `%${search}%`)
      )
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
  const offset = (page - 1) * limit;

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
    .limit(limit)
    .offset(offset);

  // Get images for all properties
  const propertyIds = result.map((r) => r.property.id);
  const images = propertyIds.length > 0
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
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get single property by ID
export async function getPropertyById(id: string, incrementView = false) {
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

  // Increment view count if requested
  if (incrementView) {
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

  return {
    ...result.property,
    owner: result.owner,
    images,
    agent,
    agency,
    priceHistory: priceHistoryData,
  };
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

  // Create images if provided
  if (images && images.length > 0) {
    await db.insert(propertyImages).values(
      images.map((img) => ({
        propertyId: newProperty.id,
        url: img.url,
        order: img.order,
        isCover: img.isCover,
      }))
    );
  }

  return getPropertyById(newProperty.id);
}

// Update property
export async function updateProperty(id: string, input: UpdatePropertyInput, userId: string) {
  // Check ownership
  const [existing] = await db
    .select({ ownerId: properties.ownerId, price: properties.price, currency: properties.currency })
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Property not found");
  }

  if (existing.ownerId !== userId) {
    throw new Error("Not authorized to update this property");
  }

  // Track price change if price is being updated
  if (input.price !== undefined && input.price !== existing.price) {
    await db.insert(priceHistory).values({
      propertyId: id,
      previousPrice: existing.price,
      newPrice: input.price,
      currency: input.currency || existing.currency,
    });
  }

  // Update property
  const [updated] = await db
    .update(properties)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(properties.id, id))
    .returning();

  return getPropertyById(updated.id);
}

// Delete property
export async function deleteProperty(id: string, userId: string) {
  const [existing] = await db
    .select({ ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Property not found");
  }

  if (existing.ownerId !== userId) {
    throw new Error("Not authorized to delete this property");
  }

  await db.delete(properties).where(eq(properties.id, id));
}

// Update property images
export async function updatePropertyImages(
  propertyId: string,
  images: { url: string; order: number; isCover: boolean }[],
  userId: string
) {
  // Check ownership
  const [existing] = await db
    .select({ ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!existing) {
    throw new Error("Property not found");
  }

  if (existing.ownerId !== userId) {
    throw new Error("Not authorized to update this property");
  }

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
      }))
    );
  }

  return getPropertyById(propertyId);
}

// Admin: Approve property
export async function approveProperty(id: string) {
  const [updated] = await db
    .update(properties)
    .set({
      status: "active",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(properties.id, id))
    .returning();

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
    .where(eq(properties.id, id))
    .returning();

  return updated;
}

// Get featured/premium properties
export async function getFeaturedProperties(limit = 6) {
  const now = new Date();

  const result = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.status, "active"),
        eq(properties.isFeatured, true),
        or(
          sql`${properties.featuredUntil} IS NULL`,
          gte(properties.featuredUntil, now)
        )
      )
    )
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  const propertyIds = result.map((r) => r.id);
  const images = propertyIds.length > 0
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
        sql`${properties.id} != ${propertyId}`
      )
    )
    .orderBy(
      sql`ABS(${properties.price} - ${property.price})`
    )
    .limit(limit);

  const propertyIds = result.map((r) => r.id);
  const images = propertyIds.length > 0
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
