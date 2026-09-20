import { json } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "./errors";

const DB_DOWN_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNRESET",
  "CONNECT_TIMEOUT",
  "EAI_AGAIN",
  "28P01", // invalid password
  "3D000", // database does not exist
  "57P01", // admin shutdown
  "XX000", // Supabase pooler: "Tenant or user not found" (project deleted / wrong ref)
]);

/** True for driver errors that mean "the database is not reachable/usable". */
export function isDatabaseDown(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && DB_DOWN_CODES.has(code)) return true;
  const message = (error as { message?: unknown }).message;
  if (
    typeof message === "string" &&
    /DATABASE_URL is not set|relation ".+" does not exist|Tenant or user not found/.test(message)
  ) {
    return true;
  }
  // Drizzle wraps the driver error ("Failed query: …") and keeps it in `cause`
  const cause = (error as { cause?: unknown }).cause;
  return cause !== error && isDatabaseDown(cause);
}

/** Turns any thrown value into a safe JSON response. */
export function errorResponse(error: unknown, fallback = "Request failed") {
  if (error instanceof z.ZodError) {
    return json(
      {
        success: false,
        error: "Validation failed",
        code: "validation",
        details: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    return json(
      {
        success: false,
        error: error.message,
        ...(error.code ? { code: error.code } : {}),
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status },
    );
  }
  if (isDatabaseDown(error)) {
    // Configuration, not a bug: say so plainly instead of a generic 500.
    console.error(
      "database unavailable",
      (error as { code?: string }).code,
      (error as Error).message,
    );
    return json(
      { success: false, error: "Database is unavailable", code: "db_unavailable" },
      { status: 503 },
    );
  }
  console.error(fallback, error);
  return json({ success: false, error: fallback, code: "internal" }, { status: 500 });
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
  // `null` (absent query param) and "" must mean "use the default", not zero
  if (value === null || value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
