import { eq, and, desc, sql } from "drizzle-orm";
import { db, notifications } from "@/db";
import { notFound } from "./errors";

// Types
export type NotificationType =
  "message" | "lead" | "listing_approved" | "listing_rejected" | "price_drop" | "review" | "system";

/**
 * What a notification looks like on the wire. The row also carries `userId`,
 * which the client already knows (it is always the caller) and which has no
 * business being echoed back, so the DTO drops it.
 */
export interface PublicNotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

function toPublic(row: typeof notifications.$inferSelect): PublicNotification {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    content: row.content,
    data: row.data ?? null,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

// Create notification
export async function createNotification(input: CreateNotificationInput) {
  const [notification] = await db.insert(notifications).values(input).returning();

  return notification;
}

// Create notifications for multiple users
export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "userId">,
) {
  if (userIds.length === 0) return [];

  const notificationValues = userIds.map((userId) => ({
    userId,
    ...notification,
  }));

  const created = await db.insert(notifications).values(notificationValues).returning();

  return created;
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
) {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);
  const offset = (page - 1) * limit;

  const result = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    notifications: result.map(toPublic),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return Number(result?.count || 0);
}

// Mark notification as read. The `userId` predicate is the ownership check:
// another user's id simply matches nothing, which we report as 404 rather than
// a silent success, so the client never shows a state change that never happened.
export async function markNotificationAsRead(notificationId: string, userId: string) {
  const updated = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning({ id: notifications.id });

  if (updated.length === 0) throw notFound("Notification");
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// Delete notification
export async function deleteNotification(notificationId: string, userId: string) {
  const deleted = await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning({ id: notifications.id });

  if (deleted.length === 0) throw notFound("Notification");
}

// Delete all notifications
export async function deleteAllNotifications(userId: string) {
  await db.delete(notifications).where(eq(notifications.userId, userId));
}

/**
 * Event helpers.
 *
 * `title` and `content` are frozen at write time, so a row written while the
 * user browsed in Uzbek would stay Uzbek forever. Every helper therefore also
 * puts the moving parts into `data` (propertyTitle, leadName, reason, …) and
 * the client composes a localized string from `type` + `data`, falling back to
 * the stored text for rows written before this.
 */
export async function notifyListingApproved(
  userId: string,
  propertyTitle: string,
  propertyId: string,
) {
  return createNotification({
    userId,
    type: "listing_approved",
    title: "E'loningiz tasdiqlandi",
    content: `"${propertyTitle}" e'loni muvaffaqiyatli tasdiqlandi va endi boshqalar ko'ra oladi.`,
    data: { propertyId, propertyTitle },
  });
}

export async function notifyListingRejected(
  userId: string,
  propertyTitle: string,
  reason: string,
  propertyId?: string,
) {
  return createNotification({
    userId,
    type: "listing_rejected",
    title: "E'loningiz rad etildi",
    content: `"${propertyTitle}" e'loni rad etildi. Sabab: ${reason}`,
    data: { reason, propertyTitle, ...(propertyId ? { propertyId } : {}) },
  });
}

export async function notifyNewLead(
  agentUserId: string,
  propertyTitle: string,
  leadName: string,
  leadPhone: string,
  propertyId?: string,
) {
  return createNotification({
    userId: agentUserId,
    type: "lead",
    title: "Yangi so'rov",
    content: `${leadName} (${leadPhone}) "${propertyTitle}" e'loniga qiziqish bildirdi.`,
    data: { leadName, leadPhone, propertyTitle, ...(propertyId ? { propertyId } : {}) },
  });
}

export async function notifyNewReview(
  userId: string,
  reviewerName: string,
  rating: number,
  targetName: string,
) {
  return createNotification({
    userId,
    type: "review",
    title: "Yangi sharh",
    content: `${reviewerName} ${targetName} uchun ${rating} yulduzli sharh qoldirdi.`,
    data: { reviewerName, rating, targetName },
  });
}

export async function notifyPriceDrop(
  userIds: string[],
  propertyTitle: string,
  propertyId: string,
  oldPrice: number,
  newPrice: number,
  currency: string,
) {
  return createBulkNotifications(userIds, {
    type: "price_drop",
    title: "Narx tushdi!",
    content: `"${propertyTitle}" narxi ${oldPrice.toLocaleString()} ${currency} dan ${newPrice.toLocaleString()} ${currency} ga tushdi.`,
    data: { propertyId, propertyTitle, oldPrice, newPrice, currency },
  });
}

export async function notifySystemMessage(userIds: string[], title: string, content: string) {
  return createBulkNotifications(userIds, {
    type: "system",
    title,
    content,
  });
}
