// Drizzle ORM Schema for PostgreSQL/Supabase
import { pgTable, text, timestamp, boolean, integer, real, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "agent", "agency_admin", "admin"]);
export const languageEnum = pgEnum("language", ["uz", "ru", "en"]);
export const currencyEnum = pgEnum("currency", ["USD", "UZS", "EUR"]);
export const propertyTypeEnum = pgEnum("property_type", ["apartment", "house", "office", "land", "commercial"]);
export const dealTypeEnum = pgEnum("deal_type", ["sale", "rent"]);
export const propertyStatusEnum = pgEnum("property_status", ["draft", "pending", "active", "sold", "rented", "paused", "rejected", "archived"]);
export const conditionEnum = pgEnum("condition", ["new", "renovated", "good", "needs_repair"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "closed"]);
export const notificationTypeEnum = pgEnum("notification_type", ["message", "lead", "listing_approved", "listing_rejected", "price_drop", "review", "system"]);
export const reviewTargetEnum = pgEnum("review_target", ["agent", "agency", "property"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: userRoleEnum("role").notNull().default("buyer"),
  language: languageEnum("language").notNull().default("uz"),
  currency: currencyEnum("currency").notNull().default("UZS"),
  isVerified: boolean("is_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agencies table
export const agencies = pgTable("agencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo"),
  description: text("description"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull().default("Uzbekistan"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agents table
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agencyId: uuid("agency_id").references(() => agencies.id, { onDelete: "set null" }),
  bio: text("bio"),
  specializations: jsonb("specializations").$type<string[]>().notNull().default([]),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  responseTime: integer("response_time").notNull().default(60),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: propertyTypeEnum("type").notNull(),
  dealType: dealTypeEnum("deal_type").notNull(),
  price: integer("price").notNull(),
  currency: currencyEnum("currency").notNull().default("USD"),
  country: text("country").notNull().default("Uzbekistan"),
  city: text("city").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  rooms: integer("rooms").notNull().default(0),
  totalArea: real("total_area").notNull(),
  livingArea: real("living_area"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  yearBuilt: integer("year_built"),
  condition: conditionEnum("condition"),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  status: propertyStatusEnum("status").notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
  agencyId: uuid("agency_id").references(() => agencies.id, { onDelete: "set null" }),
  viewCount: integer("view_count").notNull().default(0),
  favoriteCount: integer("favorite_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  featuredUntil: timestamp("featured_until"),
  premiumUntil: timestamp("premium_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

// Property images table
export const propertyImages = pgTable("property_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
  isCover: boolean("is_cover").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  folderId: uuid("folder_id").references(() => favoriteFolders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Favorite folders table
export const favoriteFolders = pgTable("favorite_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id").references(() => users.id, { onDelete: "set null" }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  message: text("message"),
  status: leadStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: reviewTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text"),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  isVerified: boolean("is_verified").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Price history table
export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  previousPrice: integer("previous_price").notNull(),
  newPrice: integer("new_price").notNull(),
  currency: text("currency").notNull(),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
});

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "processing", "completed", "failed", "cancelled", "refunded"]);
export const paymentProviderEnum = pgEnum("payment_provider", ["payme", "click"]);
export const paymentTypeEnum = pgEnum("payment_type", ["featured", "premium", "boost"]);

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
  provider: paymentProviderEnum("provider").notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("UZS"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  externalId: text("external_id"),
  transactionId: text("transaction_id"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Market statistics table
export const marketStatistics = pgTable("market_statistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  district: text("district"),
  propertyType: text("property_type").notNull(),
  dealType: text("deal_type").notNull(),
  averagePrice: integer("average_price").notNull(),
  averagePricePerSqm: integer("average_price_per_sqm").notNull(),
  priceChange: real("price_change").notNull().default(0),
  rentalYield: real("rental_yield"),
  listingCount: integer("listing_count").notNull().default(0),
  calculatedAt: timestamp("calculated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  agent: one(agents, { fields: [users.id], references: [agents.userId] }),
  properties: many(properties),
  favorites: many(favorites),
  notifications: many(notifications),
  reviews: many(reviews),
}));

export const agenciesRelations = relations(agencies, ({ many }) => ({
  agents: many(agents),
  properties: many(properties),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  agency: one(agencies, { fields: [agents.agencyId], references: [agencies.id] }),
  properties: many(properties),
  leads: many(leads),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  agent: one(agents, { fields: [properties.agentId], references: [agents.id] }),
  agency: one(agencies, { fields: [properties.agencyId], references: [agencies.id] }),
  images: many(propertyImages),
  favorites: many(favorites),
  leads: many(leads),
  priceHistory: many(priceHistory),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  property: one(properties, { fields: [favorites.propertyId], references: [properties.id] }),
  folder: one(favoriteFolders, { fields: [favorites.folderId], references: [favoriteFolders.id] }),
}));
