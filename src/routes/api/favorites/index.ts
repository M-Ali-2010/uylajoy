import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getUserFavorites, addToFavorites, removeFromFavorites, isPropertyFavorited } from "@/lib/server/favorites";
import { getCurrentUser } from "@/lib/server/auth";
import { z } from "zod";

const addFavoriteSchema = z.object({
  propertyId: z.string().uuid(),
  folderId: z.string().uuid().optional(),
});

export const APIRoute = createAPIFileRoute("/api/favorites")({
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
      const folderId = url.searchParams.get("folderId") || undefined;

      const favorites = await getUserFavorites(user.id, folderId);

      return json({
        success: true,
        favorites,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to fetch favorites",
        },
        { status: 500 }
      );
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
          { status: 401 }
        );
      }

      const body = await request.json();
      const validated = addFavoriteSchema.parse(body);

      const favorite = await addToFavorites(user.id, validated.propertyId, validated.folderId);

      return json(
        {
          success: true,
          favorite,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json(
          {
            success: false,
            error: "Validation failed",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      return json(
        {
          success: false,
          error: "Failed to add to favorites",
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
      const propertyId = url.searchParams.get("propertyId");

      if (!propertyId) {
        return json(
          {
            success: false,
            error: "Property ID is required",
          },
          { status: 400 }
        );
      }

      const removed = await removeFromFavorites(user.id, propertyId);

      if (!removed) {
        return json(
          {
            success: false,
            error: "Favorite not found",
          },
          { status: 404 }
        );
      }

      return json({
        success: true,
        message: "Removed from favorites",
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to remove from favorites",
        },
        { status: 500 }
      );
    }
  },
});
