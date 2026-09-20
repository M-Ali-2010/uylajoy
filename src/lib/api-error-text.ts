import { ApiError } from "./api-client";
import type { TranslationKeys } from "@/i18n";

/**
 * One place that turns an API failure into a sentence in the reader's
 * language. Field errors from validation take precedence over the generic
 * code so "phone" problems say so.
 */
export function describeApiError(error: unknown, t: TranslationKeys): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message ? error.message : t.common.error;
  }

  const e = t.errors;
  const fieldMessages: Record<string, string> = {
    email: e.invalidEmail,
    password: e.weakPassword,
    phone: e.invalidPhone,
    name: e.invalidName,
  };
  for (const field of Object.keys(error.fields)) {
    const known = fieldMessages[field];
    if (known) return known;
  }

  switch (error.code) {
    case "db_unavailable":
      return e.serviceUnavailable;
    case "network":
      return e.network;
    case "rate_limited":
      return e.rateLimited;
    case "email_taken":
      return e.emailTaken;
    case "bad_credentials":
      return e.badCredentials;
    case "account_blocked":
      return e.accountBlocked;
    case "unauthorized":
      return e.unauthorized;
    case "validation":
      return e.validation;
    default:
      return error.message || t.common.error;
  }
}
