import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { agents, db, properties, users } from "@/db";
import { track } from "@/lib/server/analytics";
import { getCurrentUser } from "@/lib/server/auth";
import { clientIp, errorResponse } from "@/lib/server/http";
import { PUBLIC_STATUSES } from "@/lib/server/properties";
import { rateLimit } from "@/lib/server/rate-limit";

/**
 * Reveals the contact for a published listing on an explicit action, so the
 * phone never sits in the public payload or the HTML, and every reveal is
 * counted. Rate limited per visitor to make scraping tedious.
 */
export const Route = createFileRoute("/api/properties/$id/contact")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const id = z.string().uuid().parse(params.id);
          const user = await getCurrentUser(request);
          const ip = clientIp(request);
          rateLimit("contact", user?.id ?? ip, { limit: 30, windowMs: 60 * 60_000 });

          const [row] = await db
            .select({
              status: properties.status,
              agentId: properties.agentId,
              ownerName: users.name,
              ownerPhone: users.phone,
            })
            .from(properties)
            .innerJoin(users, eq(properties.ownerId, users.id))
            .where(eq(properties.id, id))
            .limit(1);

          if (!row || !PUBLIC_STATUSES.includes(row.status)) {
            return json({ success: false, error: "Property not found" }, { status: 404 });
          }

          let name = row.ownerName;
          let phone = row.ownerPhone;

          if (row.agentId) {
            const [agent] = await db
              .select({ name: users.name, phone: users.phone })
              .from(agents)
              .innerJoin(users, eq(agents.userId, users.id))
              .where(eq(agents.id, row.agentId))
              .limit(1);
            if (agent?.phone) {
              name = agent.name;
              phone = agent.phone;
            }
          }

          await track("contact_click", { propertyId: id, userId: user?.id, ip });

          return json({ success: true, contact: { name, phone } });
        } catch (error) {
          return errorResponse(error, "Failed to fetch contact");
        }
      },
    },
  },
});
