import { eq, and, desc, sql } from "drizzle-orm";
import { db, leads, properties, agents, users } from "@/db";
import { notifyNewLead } from "./notifications";
import { notifyNewLead as notifyTelegramLead } from "./telegram";

// Types
export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export interface CreateLeadInput {
  propertyId: string;
  buyerId?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

// Create lead
export async function createLead(input: CreateLeadInput) {
  // Get property info
  const [property] = await db
    .select({
      id: properties.id,
      title: properties.title,
      ownerId: properties.ownerId,
      agentId: properties.agentId,
    })
    .from(properties)
    .where(eq(properties.id, input.propertyId))
    .limit(1);

  if (!property) {
    throw new Error("Property not found");
  }

  // Create lead
  const [lead] = await db
    .insert(leads)
    .values({
      propertyId: input.propertyId,
      buyerId: input.buyerId,
      agentId: property.agentId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      status: "new",
    })
    .returning();

  // Notify agent or owner
  const notifyUserId = property.agentId
    ? (await db.select({ userId: agents.userId }).from(agents).where(eq(agents.id, property.agentId)).limit(1))[0]?.userId
    : property.ownerId;

  if (notifyUserId) {
    // Send in-app notification
    await notifyNewLead(notifyUserId, property.title, input.name, input.phone);

    // TODO: Send Telegram notification if user has Telegram connected
    // This would require storing Telegram chat IDs in the users table
  }

  return lead;
}

// Get leads for agent
export async function getAgentLeads(
  agentId: string,
  options: { status?: LeadStatus; page?: number; limit?: number } = {}
) {
  const { status, page = 1, limit = 20 } = options;

  const conditions = [eq(leads.agentId, agentId)];
  if (status) {
    conditions.push(eq(leads.status, status));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);
  const offset = (page - 1) * limit;

  const result = await db
    .select({
      lead: leads,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        price: properties.price,
        currency: properties.currency,
      },
    })
    .from(leads)
    .innerJoin(properties, eq(leads.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    leads: result.map((r) => ({
      ...r.lead,
      property: r.property,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get leads for property owner
export async function getOwnerLeads(
  ownerId: string,
  options: { status?: LeadStatus; page?: number; limit?: number } = {}
) {
  const { status, page = 1, limit = 20 } = options;

  // Get owner's property IDs
  const ownerProperties = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.ownerId, ownerId));

  if (ownerProperties.length === 0) {
    return {
      leads: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }

  const propertyIds = ownerProperties.map((p) => p.id);

  const conditions = [sql`${leads.propertyId} IN (${sql.join(propertyIds.map(id => sql`${id}`), sql`, `)})`];
  if (status) {
    conditions.push(eq(leads.status, status));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(and(...conditions));

  const total = Number(countResult?.count || 0);
  const offset = (page - 1) * limit;

  const result = await db
    .select({
      lead: leads,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        price: properties.price,
        currency: properties.currency,
      },
    })
    .from(leads)
    .innerJoin(properties, eq(leads.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    leads: result.map((r) => ({
      ...r.lead,
      property: r.property,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Update lead status
export async function updateLeadStatus(leadId: string, status: LeadStatus, userId: string) {
  // Verify ownership
  const [lead] = await db
    .select({
      id: leads.id,
      agentId: leads.agentId,
      propertyOwnerId: properties.ownerId,
    })
    .from(leads)
    .innerJoin(properties, eq(leads.propertyId, properties.id))
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Check if user is the agent or property owner
  let isAuthorized = lead.propertyOwnerId === userId;
  if (!isAuthorized && lead.agentId) {
    const [agent] = await db
      .select({ userId: agents.userId })
      .from(agents)
      .where(eq(agents.id, lead.agentId))
      .limit(1);
    isAuthorized = agent?.userId === userId;
  }

  if (!isAuthorized) {
    throw new Error("Not authorized to update this lead");
  }

  const [updated] = await db
    .update(leads)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId))
    .returning();

  return updated;
}

// Get lead statistics
export async function getLeadStats(userId: string) {
  // Get agent ID if exists
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1);

  const isAgent = !!agent;

  // Build query based on user type
  let baseQuery;
  if (isAgent) {
    baseQuery = db
      .select({
        status: leads.status,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.agentId, agent.id))
      .groupBy(leads.status);
  } else {
    // Owner - get leads for their properties
    const ownerProperties = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.ownerId, userId));

    if (ownerProperties.length === 0) {
      return { new: 0, contacted: 0, qualified: 0, closed: 0, total: 0 };
    }

    const propertyIds = ownerProperties.map((p) => p.id);

    baseQuery = db
      .select({
        status: leads.status,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(sql`${leads.propertyId} IN (${sql.join(propertyIds.map(id => sql`${id}`), sql`, `)})`)
      .groupBy(leads.status);
  }

  const result = await baseQuery;

  const stats = {
    new: 0,
    contacted: 0,
    qualified: 0,
    closed: 0,
    total: 0,
  };

  for (const row of result) {
    const count = Number(row.count);
    stats[row.status as LeadStatus] = count;
    stats.total += count;
  }

  return stats;
}
