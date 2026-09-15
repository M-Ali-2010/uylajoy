import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server/auth";
import { badRequest, unauthorized } from "@/lib/server/errors";
import { clampInt, errorResponse } from "@/lib/server/http";
import {
  deleteAllNotifications,
  deleteNotification,
  getUnreadCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/server/notifications";

const idSchema = z.string().uuid("Notification id must be a UUID");

async function requireUser(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) throw unauthorized();
  return user;
}

export const Route = createFileRoute("/api/notifications/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireUser(request);

          const url = new URL(request.url);
          const page = clampInt(url.searchParams.get("page"), {
            min: 1,
            max: 1000,
            fallback: 1,
          });
          const limit = clampInt(url.searchParams.get("limit"), {
            min: 1,
            max: 50,
            fallback: 20,
          });
          const unreadOnly = url.searchParams.get("unreadOnly") === "true";

          const result = await getUserNotifications(user.id, { page, limit, unreadOnly });
          const unreadCount = await getUnreadCount(user.id);

          return json({ success: true, ...result, unreadCount });
        } catch (error) {
          return errorResponse(error, "Failed to fetch notifications");
        }
      },

      // ?markAll=true — the whole inbox; ?id=<uuid> — one row
      PATCH: async ({ request }) => {
        try {
          const user = await requireUser(request);
          const url = new URL(request.url);

          if (url.searchParams.get("markAll") === "true") {
            await markAllNotificationsAsRead(user.id);
          } else {
            const id = url.searchParams.get("id");
            if (!id) throw badRequest("Notification id is required");
            await markNotificationAsRead(idSchema.parse(id), user.id);
          }

          return json({ success: true, unreadCount: await getUnreadCount(user.id) });
        } catch (error) {
          return errorResponse(error, "Failed to update notification");
        }
      },

      // ?deleteAll=true — the whole inbox; ?id=<uuid> — one row
      DELETE: async ({ request }) => {
        try {
          const user = await requireUser(request);
          const url = new URL(request.url);

          if (url.searchParams.get("deleteAll") === "true") {
            await deleteAllNotifications(user.id);
          } else {
            const id = url.searchParams.get("id");
            if (!id) throw badRequest("Notification id is required");
            await deleteNotification(idSchema.parse(id), user.id);
          }

          return json({ success: true, unreadCount: await getUnreadCount(user.id) });
        } catch (error) {
          return errorResponse(error, "Failed to delete notification");
        }
      },
    },
  },
});
