import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getCurrentUser, updateUserProfile, changePassword } from "@/lib/server/auth";
import { errorResponse, readJson } from "@/lib/server/http";
import { phoneSchema } from "@/lib/server/validation";
import { z } from "zod";
import { passwordSchema } from "@/lib/server/validation";

// `role`, `isVerified`, `isActive` and `email` are not in this schema on
// purpose: a user must never be able to promote or verify themselves.
const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: phoneSchema.optional(),
    avatar: z.string().url().max(500).optional(),
    language: z.enum(["uz", "ru", "en"]).optional(),
    currency: z.enum(["USD", "UZS", "EUR"]).optional(),
  })
  .strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

export const Route = createFileRoute("/api/auth/me")({
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

          return json({
            success: true,
            user,
          });
        } catch (error) {
          return errorResponse(error, "Failed to get user");
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
              { status: 401 },
            );
          }

          const body = await readJson(request);
          const validated = updateProfileSchema.parse(body);

          const updatedUser = await updateUserProfile(user.id, validated);

          return json({
            success: true,
            user: updatedUser,
          });
        } catch (error) {
          return errorResponse(error, "Failed to update profile");
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
              { status: 401 },
            );
          }

          const body = await readJson(request);
          const validated = changePasswordSchema.parse(body);

          await changePassword(user.id, validated.currentPassword, validated.newPassword);

          return json({
            success: true,
            message: "Password changed successfully",
          });
        } catch (error) {
          return errorResponse(error, "Failed to change password");
        }
      },
    },
  },
});
