import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, properties, propertyImages, viewingRequests } from "@/db";
import { AppError, forbidden, notFound } from "./errors";
import { PUBLIC_STATUSES } from "./properties";

export type ViewingStatus = "new" | "confirmed" | "declined" | "done";

export interface CreateViewingRequestInput {
  propertyId: string;
  userId?: string | undefined;
  name: string;
  phone: string;
  preferredAt: Date;
  message?: string | undefined;
}

export async function createViewingRequest(input: CreateViewingRequestInput) {
  const [property] = await db
    .select({ id: properties.id, status: properties.status, ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, input.propertyId))
    .limit(1);

  if (!property || !PUBLIC_STATUSES.includes(property.status)) throw notFound("Property");
  if (property.ownerId === input.userId) {
    throw new AppError(400, "You cannot request a viewing of your own listing");
  }
  if (input.preferredAt.getTime() < Date.now() - 60 * 60 * 1000) {
    throw new AppError(400, "Preferred time must be in the future");
  }

  const [created] = await db
    .insert(viewingRequests)
    .values({
      propertyId: input.propertyId,
      userId: input.userId ?? null,
      name: input.name,
      phone: input.phone,
      preferredAt: input.preferredAt,
      message: input.message ?? null,
    })
    .returning();

  if (!created) throw new AppError(500, "Failed to create viewing request");
  return { request: created, ownerId: property.ownerId };
}

/** Requests on listings the user owns, newest first. */
export async function getOwnerViewingRequests(ownerId: string, status?: ViewingStatus) {
  const conditions = [eq(properties.ownerId, ownerId)];
  if (status) conditions.push(eq(viewingRequests.status, status));

  const rows = await db
    .select({
      request: viewingRequests,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        district: properties.district,
      },
    })
    .from(viewingRequests)
    .innerJoin(properties, eq(viewingRequests.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(desc(viewingRequests.createdAt))
    .limit(200);

  return rows.map((r) => ({ ...r.request, property: r.property }));
}

/** Requests the user sent themselves. */
export async function getUserViewingRequests(userId: string) {
  const rows = await db
    .select({
      request: viewingRequests,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        district: properties.district,
      },
    })
    .from(viewingRequests)
    .innerJoin(properties, eq(viewingRequests.propertyId, properties.id))
    .where(eq(viewingRequests.userId, userId))
    .orderBy(desc(viewingRequests.createdAt))
    .limit(200);

  const ids = rows.map((r) => r.property.id);
  const covers = ids.length
    ? await db
        .select({ propertyId: propertyImages.propertyId, url: propertyImages.url })
        .from(propertyImages)
        .where(and(inArray(propertyImages.propertyId, ids), eq(propertyImages.isCover, true)))
    : [];

  return rows.map((r) => ({
    ...r.request,
    property: {
      ...r.property,
      cover: covers.find((c) => c.propertyId === r.property.id)?.url ?? null,
    },
  }));
}

/** Only the owner of the listing may move a request through its states. */
export async function updateViewingStatus(id: string, status: ViewingStatus, userId: string) {
  const [row] = await db
    .select({ id: viewingRequests.id, ownerId: properties.ownerId })
    .from(viewingRequests)
    .innerJoin(properties, eq(viewingRequests.propertyId, properties.id))
    .where(eq(viewingRequests.id, id))
    .limit(1);

  if (!row) throw notFound("Viewing request");
  if (row.ownerId !== userId) throw forbidden();

  const [updated] = await db
    .update(viewingRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(viewingRequests.id, id))
    .returning();

  return updated;
}

export async function countNewViewingRequests(ownerId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(viewingRequests)
    .innerJoin(properties, eq(viewingRequests.propertyId, properties.id))
    .where(and(eq(properties.ownerId, ownerId), eq(viewingRequests.status, "new")));
  return Number(row?.count ?? 0);
}
