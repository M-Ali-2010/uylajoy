import { eq, and, desc, sql } from "drizzle-orm";
import { db, notifications, users } from "@/db";

// Types
export type NotificationType =
  | "message"
  | "lead"
  | "listing_approved"
  | "listing_rejected"
  | "price_drop"
  | "review"
  | "system";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

// Create notification
export async function createNotification(input: CreateNotificationInput) {
  const [notification] = await db
    .insert(notifications)
    .values(input)
    .returning();

  return notification;
}

// Create notifications for multiple users
export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "userId">
) {
  if (userIds.length === 0) return [];

  const notificationValues = userIds.map((userId) => ({
    userId,
    ...notification,
  }));

  const created = await db
    .insert(notifications)
    .values(notificationValues)
    .returning();

  return created;
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
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
    notifications: result,
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

// Mark notification as read
export async function markNotificationAsRead(notificationId: string, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
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
  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

// Delete all notifications
export async function deleteAllNotifications(userId: string) {
  await db.delete(notifications).where(eq(notifications.userId, userId));
}

// Notification helper functions for specific events
export async function notifyListingApproved(userId: string, propertyTitle: string, propertyId: string) {
  return createNotification({
    userId,
    type: "listing_approved",
    title: "E'loningiz tasdiqlandi",
    content: `"${propertyTitle}" e'loni muvaffaqiyatli tasdiqlandi va endi boshqalar ko'ra oladi.`,
    data: { propertyId },
  });
}

export async function notifyListingRejected(userId: string, propertyTitle: string, reason: string) {
  return createNotification({
    userId,
    type: "listing_rejected",
    title: "E'loningiz rad etildi",
    content: `"${propertyTitle}" e'loni rad etildi. Sabab: ${reason}`,
    data: { reason },
  });
}

export async function notifyNewLead(
  agentUserId: string,
  propertyTitle: string,
  leadName: string,
  leadPhone: string
) {
  return createNotification({
    userId: agentUserId,
    type: "lead",
    title: "Yangi so'rov",
    content: `${leadName} (${leadPhone}) "${propertyTitle}" e'loniga qiziqish bildirdi.`,
    data: { leadName, leadPhone },
  });
}

export async function notifyNewReview(
  userId: string,
  reviewerName: string,
  rating: number,
  targetName: string
) {
  return createNotification({
    userId,
    type: "review",
    title: "Yangi sharh",
    content: `${reviewerName} ${targetName} uchun ${rating} yulduzli sharh qoldirdi.`,
    data: { reviewerName, rating },
  });
}

export async function notifyPriceDrop(
  userIds: string[],
  propertyTitle: string,
  propertyId: string,
  oldPrice: number,
  newPrice: number,
  currency: string
) {
  return createBulkNotifications(userIds, {
    type: "price_drop",
    title: "Narx tushdi!",
    content: `"${propertyTitle}" narxi ${oldPrice.toLocaleString()} ${currency} dan ${newPrice.toLocaleString()} ${currency} ga tushdi.`,
    data: { propertyId, oldPrice, newPrice, currency },
  });
}

export async function notifySystemMessage(userIds: string[], title: string, content: string) {
  return createBulkNotifications(userIds, {
    type: "system",
    title,
    content,
  });
}
