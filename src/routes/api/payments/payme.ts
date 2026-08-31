import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { processPaymeCallback } from "@/lib/server/payments";

// Payme merchant callback endpoint
export const APIRoute = createAPIFileRoute("/api/payments/payme")({
  POST: async ({ request }) => {
    try {
      // Verify Payme authorization
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Basic ")) {
        return json({ error: { code: -32504, message: "Unauthorized" } }, { status: 401 });
      }

      const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
      const [login, key] = credentials.split(":");

      const expectedKey = process.env.PAYME_IS_TEST === "true"
        ? process.env.PAYME_TEST_KEY
        : process.env.PAYME_SECRET_KEY;

      if (login !== "Paycom" || key !== expectedKey) {
        return json({ error: { code: -32504, message: "Unauthorized" } }, { status: 401 });
      }

      const body = await request.json();
      const result = await processPaymeCallback(body);

      return json(result);
    } catch (error) {
      console.error("Payme callback error:", error);
      return json({
        error: {
          code: -32400,
          message: "Internal server error",
        },
      });
    }
  },
});
