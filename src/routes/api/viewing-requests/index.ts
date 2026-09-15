import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { track } from "@/lib/server/analytics";
import { getCurrentUser } from "@/lib/server/auth";
import { clientIp, errorResponse, readJson } from "@/lib/server/http";
import { createNotification } from "@/lib/server/notifications";
import { RULES, rateLimit } from "@/lib/server/rate-limit";
import { phoneSchema } from "@/lib/server/validation";
import {
  createViewingRequest,
  getOwnerViewingRequests,
  getUserViewingRequests,
} from "@/lib/server/viewing-requests";

const createSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  preferredAt: z.coerce.date(),
  message: z.string().trim().max(1000).optional(),
});

const statusSchema = z.enum(["new", "confirmed", "declined", "done"]);

export const Route = createFileRoute("/api/viewing-requests/")({
  server: {
    handlers: {
      // ?scope=sent — the ones I sent; default — the ones on my listings
      GET: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);
          if (!user) return json({ success: false, error: "Unauthorized" }, { status: 401 });

          const url = new URL(request.url);
          const scope = url.searchParams.get("scope");
          const status = statusSchema.optional().parse(url.searchParams.get("status") ?? undefined);

          const requests =
            scope === "sent"
              ? await getUserViewingRequests(user.id)
              : await getOwnerViewingRequests(user.id, status);

          return json({ success: true, requests });
        } catch (error) {
          return errorResponse(error, "Failed to fetch viewing requests");
        }
      },

      POST: async ({ request }) => {
        try {
          const user = await getCurrentUser(request);
          const ip = clientIp(request);
          rateLimit("viewing", user?.id ?? ip, RULES.lead);

          const validated = createSchema.parse(await readJson(request));
          const { request: created, ownerId } = await createViewingRequest({
            ...validated,
            userId: user?.id,
          });

          await createNotification({
            userId: ownerId,
            type: "lead",
            title: "Yangi ko'rish so'rovi",
            content: `${validated.name} ${validated.preferredAt.toLocaleString("uz-UZ")} ko'rishni so'radi`,
            data: {
              viewingRequestId: created.id,
              propertyId: validated.propertyId,
              leadName: validated.name,
              preferredAt: validated.preferredAt.toISOString(),
            },
          });
          await track("viewing_requested", {
            propertyId: validated.propertyId,
            userId: user?.id,
            ip,
          });

          return json({ success: true, request: created }, { status: 201 });
        } catch (error) {
          return errorResponse(error, "Failed to create viewing request");
        }
      },
    },
  },
});
