import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { uploadImage, uploadImages, uploadAvatar, generateUploadSignature, deleteImage } from "@/lib/server/upload";
import { getCurrentUser, updateUserProfile } from "@/lib/server/auth";
import { z } from "zod";

const uploadSchema = z.object({
  image: z.string().min(1, "Image data is required"),
  folder: z.string().optional(),
});

const uploadMultipleSchema = z.object({
  images: z.array(z.string()).min(1, "At least one image is required").max(20, "Maximum 20 images"),
  folder: z.string().optional(),
});

export const APIRoute = createAPIFileRoute("/api/upload")({
  // Get upload signature for direct browser upload
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
      const folder = url.searchParams.get("folder") || "properties";

      const signature = generateUploadSignature(folder);

      return json({
        success: true,
        ...signature,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to generate upload signature",
        },
        { status: 500 }
      );
    }
  },

  // Upload single image
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

      // Check if it's avatar upload
      if (body.type === "avatar") {
        const avatarSchema = z.object({
          image: z.string().min(1, "Image data is required"),
          type: z.literal("avatar"),
        });

        const validated = avatarSchema.parse(body);
        const result = await uploadAvatar(validated.image, user.id);

        // Update user avatar in database
        await updateUserProfile(user.id, { avatar: result.url });

        return json({
          success: true,
          result,
        });
      }

      // Check if it's multiple images
      if (Array.isArray(body.images)) {
        const validated = uploadMultipleSchema.parse(body);
        const results = await uploadImages(validated.images, validated.folder);

        return json({
          success: true,
          results,
        });
      }

      // Single image upload
      const validated = uploadSchema.parse(body);
      const result = await uploadImage(validated.image, validated.folder);

      return json({
        success: true,
        result,
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

      const message = error instanceof Error ? error.message : "Failed to upload image";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 500 }
      );
    }
  },

  // Delete image
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
      const publicId = url.searchParams.get("publicId");

      if (!publicId) {
        return json(
          {
            success: false,
            error: "Public ID is required",
          },
          { status: 400 }
        );
      }

      const deleted = await deleteImage(publicId);

      if (!deleted) {
        return json(
          {
            success: false,
            error: "Failed to delete image",
          },
          { status: 500 }
        );
      }

      return json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to delete image",
        },
        { status: 500 }
      );
    }
  },
});
