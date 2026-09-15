import { createHash } from "crypto";
import { analyticsEvents, db } from "@/db";

export type AnalyticsEventType =
  | "property_view"
  | "contact_click"
  | "lead_created"
  | "viewing_requested"
  | "favorite_added"
  | "listing_created"
  | "listing_published";

/**
 * Records one product event. Visitors are stored as a salted hash of the
 * address, never the address itself; failures are swallowed so analytics can
 * never break the request that produced them.
 */
export async function track(
  type: AnalyticsEventType,
  input: {
    propertyId?: string | null | undefined;
    userId?: string | null | undefined;
    ip?: string | undefined;
    meta?: Record<string, unknown> | undefined;
  } = {},
): Promise<void> {
  try {
    await db.insert(analyticsEvents).values({
      type,
      propertyId: input.propertyId ?? null,
      userId: input.userId ?? null,
      visitorHash: input.ip ? hashVisitor(input.ip) : null,
      meta: input.meta ?? null,
    });
  } catch (error) {
    console.error("analytics", error);
  }
}

function hashVisitor(ip: string): string {
  const salt = process.env["JWT_SECRET"] ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
