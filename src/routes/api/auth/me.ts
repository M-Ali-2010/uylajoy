import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getCurrentUser, updateUserProfile, changePassword } from "@/lib/server/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  language: z.enum(["uz", "ru", "en"]).optional(),
  currency: z.enum(["USD", "UZS", "EUR"]).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const APIRoute = createAPIFileRoute("/api/auth/me")({
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

      return json({
        success: true,
        user,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to get user",
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

      const body = await request.json();
      const validated = updateProfileSchema.parse(body);

      const updatedUser = await updateUserProfile(user.id, validated);

      return json({
        success: true,
        user: updatedUser,
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

      return json(
        {
          success: false,
          error: "Failed to update profile",
        },
        { status: 500 }
      );
    }
  },

  PUT: async ({ request }) => {
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
      const validated = changePasswordSchema.parse(body);

      await changePassword(user.id, validated.currentPassword, validated.newPassword);

      return json({
        success: true,
        message: "Password changed successfully",
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

      const message = error instanceof Error ? error.message : "Failed to change password";
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
