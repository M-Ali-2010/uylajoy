// Database schema for Uylajoy
// Designed for both SQLite (development) and PostgreSQL (production/Vercel)

export type User = {
  id: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  name: string;
  avatar: string | null;
  role: "buyer" | "seller" | "agent" | "agency_admin" | "admin";
  language: "uz" | "ru" | "en";
  currency: "USD" | "UZS" | "EUR";
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Agency = {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  phone: string;
  email: string;
  website: string | null;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Agent = {
  id: string;
  userId: string;
  agencyId: string | null;
  bio: string | null;
  specializations: string[];
  rating: number;
  reviewCount: number;
  responseTime: number; // average response time in minutes
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  type: "apartment" | "house" | "office" | "land" | "commercial";
  dealType: "sale" | "rent";
  price: number;
  currency: "USD" | "UZS" | "EUR";
  country: string;
  city: string;
  district: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  rooms: number;
  totalArea: number;
  livingArea: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  condition: "new" | "renovated" | "good" | "needs_repair" | null;
  amenities: string[];
  status: "draft" | "pending" | "active" | "sold" | "rented" | "paused" | "rejected" | "archived";
  rejectionReason: string | null;
  ownerId: string;
  agentId: string | null;
  agencyId: string | null;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  featuredUntil: Date | null;
  premiumUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type PropertyImage = {
  id: string;
  propertyId: string;
  url: string;
  order: number;
  isCover: boolean;
  createdAt: Date;
};

export type Favorite = {
  id: string;
  userId: string;
  propertyId: string;
  folderId: string | null;
  createdAt: Date;
};

export type FavoriteFolder = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
};

export type Lead = {
  id: string;
  propertyId: string;
  buyerId: string;
  agentId: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  createdAt: Date;
  updatedAt: Date;
};

export type Conversation = {
  id: string;
  propertyId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationParticipant = {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: Date;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: Date;
};

export type Review = {
  id: string;
  reviewerId: string;
  targetType: "agent" | "agency" | "property";
  targetId: string;
  rating: number; // 1-5
  text: string | null;
  photos: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: "message" | "lead" | "listing_approved" | "listing_rejected" | "price_drop" | "review" | "system";
  title: string;
  content: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
};

export type PriceHistory = {
  id: string;
  propertyId: string;
  previousPrice: number;
  newPrice: number;
  currency: string;
  changedAt: Date;
};

export type MarketStatistics = {
  id: string;
  country: string;
  city: string;
  district: string | null;
  propertyType: string;
  dealType: string;
  averagePrice: number;
  averagePricePerSqm: number;
  priceChange: number; // percentage
  rentalYield: number | null;
  listingCount: number;
  calculatedAt: Date;
};

// Session for authentication
export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};
