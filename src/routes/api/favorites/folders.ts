import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getUserFolders, createFolder, updateFolder, deleteFolder } from "@/lib/server/favorites";
import { getCurrentUser } from "@/lib/server/auth";
import { z } from "zod";

const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(50, "Folder name is too long"),
});

export const APIRoute = createAPIFileRoute("/api/favorites/folders")({
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

      const folders = await getUserFolders(user.id);

      return json({
        success: true,
        folders,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to fetch folders",
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
      const validated = folderSchema.parse(body);

      const folder = await createFolder(user.id, validated.name);

      return json(
        {
          success: true,
          folder,
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
          error: "Failed to create folder",
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
      const folderId = url.searchParams.get("id");

      if (!folderId) {
        return json(
          {
            success: false,
            error: "Folder ID is required",
          },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validated = folderSchema.parse(body);

      const folder = await updateFolder(user.id, folderId, validated.name);

      return json({
        success: true,
        folder,
      });
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

      const message = error instanceof Error ? error.message : "Failed to update folder";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
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
      const folderId = url.searchParams.get("id");

      if (!folderId) {
        return json(
          {
            success: false,
            error: "Folder ID is required",
          },
          { status: 400 }
        );
      }

      await deleteFolder(user.id, folderId);

      return json({
        success: true,
        message: "Folder deleted",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete folder";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }
  },
});
