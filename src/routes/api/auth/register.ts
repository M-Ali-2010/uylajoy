import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { registerUser } from "@/lib/server/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  role: z.enum(["buyer", "seller", "agent"]).optional(),
});

export const APIRoute = createAPIFileRoute("/api/auth/register")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validated = registerSchema.parse(body);

      const { user, token } = await registerUser(validated);

      return json(
        {
          success: true,
          user,
          token,
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

      const message = error instanceof Error ? error.message : "Registration failed";
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
