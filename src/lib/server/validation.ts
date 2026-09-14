import { z } from "zod";

/**
 * Uzbek numbers normalised to E.164: "+998 90 123 45 67", "90 123-45-67",
 * "998901234567" all become "+998901234567". Other countries are accepted
 * only in full international form.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  const bare = digits.replace(/^\+/, "");

  if (/^998\d{9}$/.test(bare)) return `+${bare}`;
  if (/^\d{9}$/.test(bare)) return `+998${bare}`;
  if (digits.startsWith("+") && /^\d{8,15}$/.test(bare)) return `+${bare}`;

  return null;
}

export const phoneSchema = z
  .string()
  .trim()
  .max(24)
  .transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid phone number" });
      return z.NEVER;
    }
    return normalized;
  });
