import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/server/notifications";
import { getCurrentUser } from "@/lib/server/auth";

export const APIRoute = createAPIFileRoute("/api/notifications")({
  GET: async ({ request }) => {
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

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);
      const unreadOnly = url.searchParams.get("unreadOnly") === "true";

      const result = await getUserNotifications(user.id, { page, limit, unreadOnly });
      const unreadCount = await getUnreadCount(user.id);

      return json({
        success: true,
        ...result,
        unreadCount,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to fetch notifications",
        },
        { status: 500 }
      );
    }
  },

  PATCH: async ({ request }) => {
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

      const url = new URL(request.url);
      const notificationId = url.searchParams.get("id");
      const markAll = url.searchParams.get("markAll") === "true";

      if (markAll) {
        await markAllNotificationsAsRead(user.id);
        return json({
          success: true,
          message: "All notifications marked as read",
        });
      }

      if (!notificationId) {
        return json(
          {
            success: false,
            error: "Notification ID is required",
          },
          { status: 400 }
        );
      }

      await markNotificationAsRead(notificationId, user.id);

      return json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to update notification",
        },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ request }) => {
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

      const url = new URL(request.url);
      const notificationId = url.searchParams.get("id");
      const deleteAll = url.searchParams.get("deleteAll") === "true";

      if (deleteAll) {
        await deleteAllNotifications(user.id);
        return json({
          success: true,
          message: "All notifications deleted",
        });
      }

      if (!notificationId) {
        return json(
          {
            success: false,
            error: "Notification ID is required",
          },
          { status: 400 }
        );
      }

      await deleteNotification(notificationId, user.id);

      return json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to delete notification",
        },
        { status: 500 }
      );
    }
  },
});
