import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { db, users, sessions, agents } from "@/db";
import { randomUUID } from "crypto";
import { AppError } from "./errors";

// Refuse to start without a real secret. A fallback string here would mean
// every deployment that forgot the variable signs tokens with a public key.
const jwtSecretFromEnv = process.env["JWT_SECRET"];
if (!jwtSecretFromEnv || jwtSecretFromEnv.length < 32) {
  throw new Error("JWT_SECRET is missing or shorter than 32 characters — refusing to start");
}
const JWT_SECRET: string = jwtSecretFromEnv;
const JWT_EXPIRES_IN = "7d";
const SESSION_EXPIRES_DAYS = 7;

/**
 * First-admin bootstrap. Registration can never hand out the admin role, so the
 * very first admin is whoever is listed in ADMIN_EMAILS (comma-separated).
 * Promotion also happens on login, so an existing account gets the role the
 * moment the variable is set — no SQL against production needed.
 */
function isBootstrapAdmin(email: string): boolean {
  const list = (process.env["ADMIN_EMAILS"] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

// Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "agent" | "agency_admin" | "admin";
  avatar?: string | null;
  phone?: string | null;
  isVerified: boolean;
  language: "uz" | "ru" | "en";
  currency: "USD" | "UZS" | "EUR";
}

export interface JWTPayload {
  userId: string;
  sessionId: string;
  role: string;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded !== "object" || decoded === null) return null;
    const { userId, sessionId, role } = decoded as Partial<JWTPayload>;
    if (typeof userId !== "string" || typeof sessionId !== "string") return null;
    return { userId, sessionId, role: typeof role === "string" ? role : "" };
  } catch {
    return null;
  }
}

// Session management
export async function createSession(userId: string): Promise<{ token: string; sessionId: string }> {
  const sessionId = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRES_DAYS);

  const token = generateToken({ userId, sessionId, role: "" });

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
  });

  return { token, sessionId };
}

export async function validateSession(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, payload.sessionId), eq(sessions.token, token)))
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
    }
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
      phone: users.phone,
      isVerified: users.isVerified,
      isActive: users.isActive,
      language: users.language,
      currency: users.currency,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  // A blocked account must lose access at once, not when its session expires.
  if (!user || !user.isVerified || !user.isActive) {
    if (user && !user.isActive) await deleteAllUserSessions(user.id);
    return null;
  }

  const { isActive: _ignored, ...authUser } = user;
  return authUser as AuthUser;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// User registration
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string | undefined;
  role?: "buyer" | "seller" | "agent" | undefined;
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: AuthUser; token: string }> {
  // Check if user already exists
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existingUser) {
    throw new AppError(409, "User with this email already exists", undefined, "email_taken");
  }

  const role = isBootstrapAdmin(input.email) ? "admin" : input.role || "buyer";

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      phone: input.phone,
      role,
      isVerified: true, // For now, auto-verify. In production, send verification email
    })
    .returning();

  if (!newUser) throw new AppError(500, "Failed to create user");

  // If registering as agent, create agent profile
  if (input.role === "agent") {
    await db.insert(agents).values({
      userId: newUser.id,
    });
  }

  // Create session
  const { token } = await createSession(newUser.id);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      phone: newUser.phone,
      isVerified: newUser.isVerified,
      language: newUser.language,
      currency: newUser.currency,
    },
    token,
  };
}

// User login
export interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (!user) {
    throw new AppError(401, "Invalid email or password", undefined, "bad_credentials");
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError(401, "Invalid email or password", undefined, "bad_credentials");
  }

  if (!user.isActive) {
    throw new AppError(403, "Account is deactivated", undefined, "account_blocked");
  }

  // Bootstrap: promote a listed email the first time it signs in
  let role = user.role;
  if (role !== "admin" && isBootstrapAdmin(user.email)) {
    role = "admin";
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, user.id));
  }

  // Create session
  const { token } = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      avatar: user.avatar,
      phone: user.phone,
      isVerified: user.isVerified,
      language: user.language,
      currency: user.currency,
    },
    token,
  };
}

// Logout
export async function logoutUser(token: string): Promise<void> {
  const payload = verifyToken(token);
  if (payload) {
    await deleteSession(payload.sessionId);
  }
}

// Get current user from request
export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return validateSession(token);
}

// Update user profile
export interface UpdateProfileInput {
  name?: string | undefined;
  phone?: string | undefined;
  avatar?: string | undefined;
  language?: "uz" | "ru" | "en" | undefined;
  currency?: "USD" | "UZS" | "EUR" | undefined;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<AuthUser> {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) throw new AppError(404, "User not found");

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    phone: updatedUser.phone,
    isVerified: updatedUser.isVerified,
    language: updatedUser.language,
    currency: updatedUser.currency,
  };
}

// Change password
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError(400, "Current password is incorrect", undefined, "bad_credentials");
  }

  const newPasswordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Invalidate all other sessions
  await deleteAllUserSessions(userId);
}
