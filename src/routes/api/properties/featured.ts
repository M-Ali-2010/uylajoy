import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getFeaturedProperties } from "@/lib/server/properties";

export const Route = createFileRoute("/api/properties/featured")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = parseInt(url.searchParams.get("limit") || "6", 10);

          const properties = await getFeaturedProperties(limit);

          return json({
            success: true,
            properties,
          });
        } catch (error) {
          return json(
            {
              success: false,
              error: "Failed to fetch featured properties",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
