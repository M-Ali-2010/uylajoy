import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { registerUser } from "@/lib/server/auth";
import { clientIp, errorResponse, readJson } from "@/lib/server/http";
import { RULES, rateLimit } from "@/lib/server/rate-limit";
import { passwordSchema, phoneSchema } from "@/lib/server/validation";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
  password: passwordSchema,
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: phoneSchema.optional(),
  // `admin` and `agency_admin` are intentionally not accepted here.
  role: z.enum(["buyer", "seller", "agent"]).optional(),
});

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          rateLimit("register-ip", clientIp(request), RULES.register);

          const validated = registerSchema.parse(await readJson(request));
          const { user, token } = await registerUser(validated);

          return json({ success: true, user, token }, { status: 201 });
        } catch (error) {
          return errorResponse(error, "Registration failed");
        }
      },
    },
  },
});
