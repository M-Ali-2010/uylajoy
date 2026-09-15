import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isPropertyFavorited,
} from "@/lib/server/favorites";
import { track } from "@/lib/server/analytics";
import { getCurrentUser } from "@/lib/server/auth";
import { errorResponse, readJson } from "@/lib/server/http";
import { z } from "zod";

const addFavoriteSchema = z.object({
  propertyId: z.string().uuid(),
  folderId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/favorites/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);

          if (!user) {
            return json(
              {
                success: false,
                error: "Unauthorized",
              },
              { status: 401 },
            );
          }

          const url = new URL(request.url);
          const folderId = url.searchParams.get("folderId") || undefined;

          const favorites = await getUserFavorites(user.id, folderId);

          return json({
            success: true,
            favorites,
          });
        } catch (error) {
          return errorResponse(error, "Failed to fetch favorites");
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
              { status: 401 },
            );
          }

          const body = await readJson(request);
          const validated = addFavoriteSchema.parse(body);

          const favorite = await addToFavorites(user.id, validated.propertyId, validated.folderId);
          void track("favorite_added", { propertyId: validated.propertyId, userId: user.id });

          return json(
            {
              success: true,
              favorite,
            },
            { status: 201 },
          );
        } catch (error) {
          return errorResponse(error, "Failed to add to favorites");
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
              { status: 401 },
            );
          }

          const url = new URL(request.url);
          const propertyId = url.searchParams.get("propertyId");

          if (!propertyId) {
            return json(
              {
                success: false,
                error: "Property ID is required",
              },
              { status: 400 },
            );
          }

          const removed = await removeFromFavorites(user.id, propertyId);

          if (!removed) {
            return json(
              {
                success: false,
                error: "Favorite not found",
              },
              { status: 404 },
            );
          }

          return json({
            success: true,
            message: "Removed from favorites",
          });
        } catch (error) {
          return errorResponse(error, "Failed to remove from favorites");
        }
      },
    },
  },
});
