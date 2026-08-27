// API service layer
// Centralized API calls that can connect to backend

import type { Property, User, Lead, Review, Notification, Favorite } from "@/db/schema";

// For now, we'll use mock data and prepare for real API
// When backend is ready, we just need to update the fetch calls

const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.message || `Error: ${response.status}` };
    }

    const data = await response.json();
    return { data: data.data ?? data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    apiFetch<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => apiFetch("/auth/logout", { method: "POST" }),

  me: () => apiFetch<User>("/auth/me"),

  forgotPassword: (email: string) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};

// Properties API
export const propertiesApi = {
  list: (params?: {
    dealType?: "sale" | "rent";
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    rooms?: number;
    minArea?: number;
    maxArea?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return apiFetch<{ properties: Property[]; total: number; page: number; pages: number }>(
      `/properties?${searchParams}`
    );
  },

  get: (id: string) => apiFetch<Property>(`/properties/${id}`),

  create: (data: Partial<Property>) =>
    apiFetch<Property>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Property>) =>
    apiFetch<Property>(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/properties/${id}`, { method: "DELETE" }),

  uploadImages: (id: string, files: FormData) =>
    fetch(`${API_BASE}/properties/${id}/images`, {
      method: "POST",
      body: files,
    }),

  featured: () => apiFetch<Property[]>("/properties/featured"),

  similar: (id: string) => apiFetch<Property[]>(`/properties/${id}/similar`),
};

// Favorites API
export const favoritesApi = {
  list: (folderId?: string) => {
    const params = folderId ? `?folderId=${folderId}` : "";
    return apiFetch<Favorite[]>(`/favorites${params}`);
  },

  add: (propertyId: string, folderId?: string) =>
    apiFetch<Favorite>("/favorites", {
      method: "POST",
      body: JSON.stringify({ propertyId, folderId }),
    }),

  remove: (propertyId: string) =>
    apiFetch(`/favorites/${propertyId}`, { method: "DELETE" }),

  check: (propertyId: string) => apiFetch<{ isFavorite: boolean }>(`/favorites/check/${propertyId}`),

  folders: {
    list: () => apiFetch<{ id: string; name: string; count: number }[]>("/favorites/folders"),

    create: (name: string) =>
      apiFetch("/favorites/folders", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),

    delete: (id: string) =>
      apiFetch(`/favorites/folders/${id}`, { method: "DELETE" }),

    rename: (id: string, name: string) =>
      apiFetch(`/favorites/folders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
  },
};

// Leads API
export const leadsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return apiFetch<{ leads: Lead[]; total: number }>(`/leads?${searchParams}`);
  },

  create: (data: { propertyId: string; name: string; phone: string; email?: string; message?: string }) =>
    apiFetch<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: Lead["status"]) =>
    apiFetch(`/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Reviews API
export const reviewsApi = {
  list: (targetType: "agent" | "agency" | "property", targetId: string) =>
    apiFetch<Review[]>(`/reviews/${targetType}/${targetId}`),

  create: (data: { targetType: string; targetId: string; rating: number; text?: string }) =>
    apiFetch<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  helpful: (id: string) =>
    apiFetch(`/reviews/${id}/helpful`, { method: "POST" }),
};

// Notifications API
export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return apiFetch<{ notifications: Notification[]; unreadCount: number }>(`/notifications?${searchParams}`);
  },

  markRead: (id: string) =>
    apiFetch(`/notifications/${id}/read`, { method: "POST" }),

  markAllRead: () =>
    apiFetch("/notifications/read-all", { method: "POST" }),

  unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count"),
};

// Analytics API
export const analyticsApi = {
  market: (params: { country?: string; city?: string; district?: string; propertyType?: string }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    return apiFetch<{
      averagePrice: number;
      averagePricePerSqm: number;
      priceChange: number;
      rentalYield: number;
      listingCount: number;
    }>(`/analytics/market?${searchParams}`);
  },

  dashboard: () =>
    apiFetch<{
      totalListings: number;
      activeListings: number;
      soldListings: number;
      pendingListings: number;
      totalViews: number;
      totalFavorites: number;
      totalLeads: number;
      recentLeads: Lead[];
    }>("/analytics/dashboard"),
};

// Users API
export const usersApi = {
  profile: () => apiFetch<User>("/users/me"),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch("/users/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  uploadAvatar: (file: FormData) =>
    fetch(`${API_BASE}/users/me/avatar`, {
      method: "POST",
      body: file,
    }),
};

// Agents API
export const agentsApi = {
  list: (params?: { city?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return apiFetch(`/agents?${searchParams}`);
  },

  get: (id: string) => apiFetch(`/agents/${id}`),

  listings: (id: string) => apiFetch<Property[]>(`/agents/${id}/listings`),
};

// Agencies API
export const agenciesApi = {
  list: (params?: { city?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return apiFetch(`/agencies?${searchParams}`);
  },

  get: (id: string) => apiFetch(`/agencies/${id}`),

  agents: (id: string) => apiFetch(`/agencies/${id}/agents`),

  listings: (id: string) => apiFetch<Property[]>(`/agencies/${id}/listings`),
};
