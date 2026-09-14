import { json } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "./errors";

/** Turns any thrown value into a safe JSON response. */
export function errorResponse(error: unknown, fallback = "Request failed") {
  if (error instanceof z.ZodError) {
    return json(
      { success: false, error: "Validation failed", details: error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    return json(
      {
        success: false,
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status },
    );
  }
  console.error(fallback, error);
  return json({ success: false, error: fallback }, { status: 500 });
}

/** Parses a JSON body, treating malformed JSON as a 400 rather than a 500. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError(400, "Request body must be valid JSON");
  }
}

/**
 * Client address for rate limiting. Trusts x-forwarded-for, which Vercel (and
 * any sane reverse proxy) overwrites, so a client cannot forge it there. If
 * the app is ever exposed without a proxy, key limiters on something else.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Clamp a pagination value from the query string. */
export function clampInt(
  value: unknown,
  { min, max, fallback }: { min: number; max: number; fallback: number },
) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
