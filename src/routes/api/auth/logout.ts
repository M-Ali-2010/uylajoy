import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { logoutUser } from "@/lib/server/auth";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("Authorization");
          if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            await logoutUser(token);
          }

          return json({
            success: true,
            message: "Logged out successfully",
          });
        } catch (error) {
          return json(
            {
              success: false,
              error: "Logout failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
