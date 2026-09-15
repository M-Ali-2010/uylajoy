import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server/auth";
import { errorResponse, readJson } from "@/lib/server/http";
import { updateViewingStatus } from "@/lib/server/viewing-requests";

const patchSchema = z.object({ status: z.enum(["new", "confirmed", "declined", "done"]) });

export const Route = createFileRoute("/api/viewing-requests/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user) return json({ success: false, error: "Unauthorized" }, { status: 401 });

          const id = z.string().uuid().parse(params.id);
          const { status } = patchSchema.parse(await readJson(request));
          const updated = await updateViewingStatus(id, status, user.id);

          return json({ success: true, request: updated });
        } catch (error) {
          return errorResponse(error, "Failed to update viewing request");
        }
      },
    },
  },
});
