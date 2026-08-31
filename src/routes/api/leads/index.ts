import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createLead, getAgentLeads, getOwnerLeads, updateLeadStatus, getLeadStats } from "@/lib/server/leads";
import { getCurrentUser } from "@/lib/server/auth";
import { db, agents } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createLeadSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(9, "Valid phone number is required"),
  email: z.string().email().optional(),
  message: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "closed"]),
});

export const APIRoute = createAPIFileRoute("/api/leads")({
  GET: async ({ request }) => {
    try {
      const user = await getCurrentUser(request);

      if (!user) {
        return json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);
      const status = url.searchParams.get("status") as "new" | "contacted" | "qualified" | "closed" | null;
      const statsOnly = url.searchParams.get("stats") === "true";

      // Return stats only if requested
      if (statsOnly) {
        const stats = await getLeadStats(user.id);
        return json({
          success: true,
          stats,
        });
      }

      // Check if user is an agent
      const [agent] = await db
        .select({ id: agents.id })
        .from(agents)
        .where(eq(agents.userId, user.id))
        .limit(1);

      let result;
      if (agent) {
        result = await getAgentLeads(agent.id, { status: status || undefined, page, limit });
      } else {
        result = await getOwnerLeads(user.id, { status: status || undefined, page, limit });
      }

      return json({
        success: true,
        ...result,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: "Failed to fetch leads",
        },
        { status: 500 }
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validated = createLeadSchema.parse(body);

      // Optional: get current user if logged in
      const user = await getCurrentUser(request);

      const lead = await createLead({
        ...validated,
        buyerId: user?.id,
      });

      return json(
        {
          success: true,
          lead,
          message: "So'rovingiz yuborildi. Tez orada siz bilan bog'lanishadi.",
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

      const message = error instanceof Error ? error.message : "Failed to create lead";
      return json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }
  },

  PATCH: async ({ request }) => {
    try {
      const user = await getCurrentUser(request);

      if (!user) {
        return json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const leadId = url.searchParams.get("id");

      if (!leadId) {
        return json(
          {
            success: false,
            error: "Lead ID is required",
          },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validated = updateStatusSchema.parse(body);

      const lead = await updateLeadStatus(leadId, validated.status, user.id);

      return json({
        success: true,
        lead,
      });
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

      const message = error instanceof Error ? error.message : "Failed to update lead";
      const status = message.includes("Not authorized") ? 403 : message.includes("not found") ? 404 : 400;

      return json(
        {
          success: false,
          error: message,
        },
        { status }
      );
    }
  },
});
