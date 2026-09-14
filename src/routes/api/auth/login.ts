import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { loginUser } from "@/lib/server/auth";
import { clientIp, errorResponse, readJson } from "@/lib/server/http";
import { RULES, rateLimit } from "@/lib/server/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
  password: z.string().min(1, "Password is required").max(200),
});

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const ip = clientIp(request);
          rateLimit("login-ip", ip, RULES.login);

          const validated = loginSchema.parse(await readJson(request));
          // Second bucket per account, so one address cannot brute-force one login
          rateLimit("login-account", validated.email, RULES.login);

          const { user, token } = await loginUser(validated);
          return json({ success: true, user, token });
        } catch (error) {
          return errorResponse(error, "Login failed");
        }
      },
    },
  },
});
