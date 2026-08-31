import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { loginUser } from "@/lib/server/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const APIRoute = createAPIFileRoute("/api/auth/login")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validated = loginSchema.parse(body);

      const { user, token } = await loginUser(validated);

      return json({
        success: true,
        user,
        token,
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

      const message = error instanceof Error ? error.message : "Login failed";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 401 }
      );
    }
  },
});
