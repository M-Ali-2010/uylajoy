import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { logoutUser } from "@/lib/server/auth";

export const APIRoute = createAPIFileRoute("/api/auth/logout")({
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
        { status: 500 }
      );
    }
  },
});
