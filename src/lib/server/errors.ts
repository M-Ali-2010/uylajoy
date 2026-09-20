/**
 * The only error type whose message is allowed to reach the client.
 * Anything else (driver errors, bugs) is logged and replaced with a generic
 * message so SQL text and stack details never leak through a JSON response.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    /** Stable identifier the client maps to a localised message. */
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what = "Resource") => new AppError(404, `${what} not found`);
export const forbidden = (message = "Not authorized") => new AppError(403, message);
export const unauthorized = () => new AppError(401, "Unauthorized");
export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, message, details);
