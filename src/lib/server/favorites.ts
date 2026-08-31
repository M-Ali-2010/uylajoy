import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db, favorites, favoriteFolders, properties, propertyImages } from "@/db";

// Get user's favorites
export async function getUserFavorites(userId: string, folderId?: string) {
  const conditions = [eq(favorites.userId, userId)];

  if (folderId) {
    conditions.push(eq(favorites.folderId, folderId));
  }

  const result = await db
    .select({
      favorite: favorites,
      property: properties,
    })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(desc(favorites.createdAt));

  const propertyIds = result.map((r) => r.property.id);
  const images = propertyIds.length > 0
    ? await db
        .select()
        .from(propertyImages)
        .where(inArray(propertyImages.propertyId, propertyIds))
    : [];

  return result.map((r) => ({
    id: r.favorite.id,
    folderId: r.favorite.folderId,
    createdAt: r.favorite.createdAt,
    property: {
      ...r.property,
      images: images.filter((img) => img.propertyId === r.property.id),
    },
  }));
}

// Add to favorites
export async function addToFavorites(userId: string, propertyId: string, folderId?: string) {
  // Check if already favorited
  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
    .limit(1);

  if (existing) {
    // Update folder if provided
    if (folderId !== undefined) {
      await db
        .update(favorites)
        .set({ folderId })
        .where(eq(favorites.id, existing.id));
    }
    return existing;
  }

  // Add to favorites
  const [newFavorite] = await db
    .insert(favorites)
    .values({
      userId,
      propertyId,
      folderId,
    })
    .returning();

  // Increment property favorite count
  await db
    .update(properties)
    .set({ favoriteCount: sql`${properties.favoriteCount} + 1` })
    .where(eq(properties.id, propertyId));

  return newFavorite;
}

// Remove from favorites
export async function removeFromFavorites(userId: string, propertyId: string) {
  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
    .limit(1);

  if (!existing) {
    return false;
  }

  await db.delete(favorites).where(eq(favorites.id, existing.id));

  // Decrement property favorite count
  await db
    .update(properties)
    .set({ favoriteCount: sql`GREATEST(${properties.favoriteCount} - 1, 0)` })
    .where(eq(properties.id, propertyId));

  return true;
}

// Check if property is favorited
export async function isPropertyFavorited(userId: string, propertyId: string) {
  const [existing] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
    .limit(1);

  return !!existing;
}

// Get user's favorite folders
export async function getUserFolders(userId: string) {
  const folders = await db
    .select()
    .from(favoriteFolders)
    .where(eq(favoriteFolders.userId, userId))
    .orderBy(desc(favoriteFolders.createdAt));

  // Get count for each folder
  const foldersWithCount = await Promise.all(
    folders.map(async (folder) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(favorites)
        .where(eq(favorites.folderId, folder.id));

      return {
        ...folder,
        count: Number(countResult?.count || 0),
      };
    })
  );

  return foldersWithCount;
}

// Create folder
export async function createFolder(userId: string, name: string) {
  const [newFolder] = await db
    .insert(favoriteFolders)
    .values({
      userId,
      name,
    })
    .returning();

  return { ...newFolder, count: 0 };
}

// Update folder
export async function updateFolder(userId: string, folderId: string, name: string) {
  const [existing] = await db
    .select()
    .from(favoriteFolders)
    .where(and(eq(favoriteFolders.id, folderId), eq(favoriteFolders.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new Error("Folder not found");
  }

  const [updated] = await db
    .update(favoriteFolders)
    .set({ name })
    .where(eq(favoriteFolders.id, folderId))
    .returning();

  return updated;
}

// Delete folder
export async function deleteFolder(userId: string, folderId: string) {
  const [existing] = await db
    .select()
    .from(favoriteFolders)
    .where(and(eq(favoriteFolders.id, folderId), eq(favoriteFolders.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new Error("Folder not found");
  }

  // Set favorites in this folder to null
  await db
    .update(favorites)
    .set({ folderId: null })
    .where(eq(favorites.folderId, folderId));

  await db.delete(favoriteFolders).where(eq(favoriteFolders.id, folderId));
}
