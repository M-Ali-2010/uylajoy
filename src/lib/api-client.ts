// API Client for frontend to backend communication

const API_BASE = "/api";

// Token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("auth_token");
  }
  return authToken;
}

/**
 * Every failed request throws this. `code` is the stable identifier the UI
 * maps to a localised sentence; `fields` carries per-field validation errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly fields: Record<string, string[]> = {},
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Base fetch with auth
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError("Network error", 0, "network");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    details?: unknown;
  };

  if (!response.ok) {
    const fields =
      data.code === "validation" && data.details && typeof data.details === "object"
        ? (data.details as Record<string, string[]>)
        : {};
    throw new ApiError(
      data.error || "API request failed",
      response.status,
      data.code ?? (response.status === 401 ? "unauthorized" : "internal"),
      fields,
      data.details,
    );
  }

  return data as T;
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string | undefined;
    role?: string | undefined;
  }) =>
    apiFetch<{ success: boolean; user: unknown; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ success: boolean; user: unknown; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),

  getMe: () => apiFetch<{ success: boolean; user: unknown }>("/auth/me"),

  updateProfile: (data: {
    name?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    language?: string | undefined;
    currency?: string | undefined;
  }) =>
    apiFetch<{ success: boolean; user: unknown }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ success: boolean }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Properties API
export interface PropertyFilters {
  type?: string | undefined;
  dealType?: string | undefined;
  city?: string | undefined;
  district?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minRooms?: number | undefined;
  maxRooms?: number | undefined;
  minArea?: number | undefined;
  maxArea?: number | undefined;
  condition?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  mine?: "1" | undefined;
}

export const propertiesApi = {
  getAll: (filters: PropertyFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    return apiFetch<{ success: boolean; properties: unknown[]; pagination: unknown }>(
      `/properties?${params.toString()}`,
    );
  },

  getById: (id: string) =>
    apiFetch<{ success: boolean; property: unknown; similar: unknown[] }>(`/properties/${id}`),

  getFeatured: (limit = 6) =>
    apiFetch<{ success: boolean; properties: unknown[] }>(`/properties/featured?limit=${limit}`),

  create: (data: unknown) =>
    apiFetch<{ success: boolean; property: unknown }>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    apiFetch<{ success: boolean; property: unknown }>(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/properties/${id}`, {
      method: "DELETE",
    }),
};

// Favorites API
export const favoritesApi = {
  getAll: (folderId?: string) => {
    const params = folderId ? `?folderId=${folderId}` : "";
    return apiFetch<{ success: boolean; favorites: unknown[] }>(`/favorites${params}`);
  },

  add: (propertyId: string, folderId?: string) =>
    apiFetch<{ success: boolean; favorite: unknown }>("/favorites", {
      method: "POST",
      body: JSON.stringify({ propertyId, folderId }),
    }),

  remove: (propertyId: string) =>
    apiFetch<{ success: boolean }>(`/favorites?propertyId=${propertyId}`, {
      method: "DELETE",
    }),

  getFolders: () => apiFetch<{ success: boolean; folders: unknown[] }>("/favorites/folders"),

  createFolder: (name: string) =>
    apiFetch<{ success: boolean; folder: unknown }>("/favorites/folders", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  updateFolder: (id: string, name: string) =>
    apiFetch<{ success: boolean; folder: unknown }>(`/favorites/folders?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  deleteFolder: (id: string) =>
    apiFetch<{ success: boolean }>(`/favorites/folders?id=${id}`, {
      method: "DELETE",
    }),
};

// Leads API
export const leadsApi = {
  create: (data: {
    propertyId: string;
    name: string;
    phone: string;
    email?: string | undefined;
    message?: string | undefined;
  }) =>
    apiFetch<{ success: boolean; lead: unknown; message: string }>("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (options: { status?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<{ success: boolean; leads: unknown[]; pagination: unknown }>(
      `/leads?${params.toString()}`,
    );
  },

  getStats: () => apiFetch<{ success: boolean; stats: unknown }>("/leads?stats=true"),

  updateStatus: (id: string, status: string) =>
    apiFetch<{ success: boolean; lead: unknown }>(`/leads?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: (options: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<{
      success: boolean;
      notifications: unknown[];
      pagination: unknown;
      unreadCount: number;
    }>(`/notifications?${params.toString()}`);
  },

  markAsRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications?id=${id}`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiFetch<{ success: boolean }>("/notifications?markAll=true", {
      method: "PATCH",
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications?id=${id}`, {
      method: "DELETE",
    }),

  deleteAll: () =>
    apiFetch<{ success: boolean }>("/notifications?deleteAll=true", {
      method: "DELETE",
    }),
};

// Payments API
export const paymentsApi = {
  getPricing: () =>
    apiFetch<{ success: boolean; pricing: unknown; benefits: unknown }>("/payments/pricing"),

  create: (data: {
    propertyId: string;
    provider: "payme" | "click";
    paymentType: string;
    duration?: string;
  }) =>
    apiFetch<{ success: boolean; payment: unknown; paymentUrl: string }>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () => apiFetch<{ success: boolean; payments: unknown[] }>("/payments"),

  getById: (id: string) => apiFetch<{ success: boolean; payment: unknown }>(`/payments?id=${id}`),
};

// Upload API
export const uploadApi = {
  uploadImage: (base64Data: string, folder = "properties") =>
    apiFetch<{ success: boolean; result: { url: string; publicId: string } }>("/upload", {
      method: "POST",
      body: JSON.stringify({ image: base64Data, folder }),
    }),

  uploadImages: (base64DataArray: string[], folder = "properties") =>
    apiFetch<{ success: boolean; results: { url: string; publicId: string }[] }>("/upload", {
      method: "POST",
      body: JSON.stringify({ images: base64DataArray, folder }),
    }),

  uploadAvatar: (base64Data: string) =>
    apiFetch<{ success: boolean; result: { url: string } }>("/upload", {
      method: "POST",
      body: JSON.stringify({ image: base64Data, type: "avatar" }),
    }),

  deleteImage: (publicId: string) =>
    apiFetch<{ success: boolean }>(`/upload?publicId=${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    }),
};

// Helper to convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// Viewing requests API
export const viewingApi = {
  create: (data: {
    propertyId: string;
    name: string;
    phone: string;
    preferredAt: string;
    message?: string | undefined;
  }) =>
    apiFetch<{ success: boolean; request: unknown }>("/viewing-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getForOwner: (status?: string) =>
    apiFetch<{ success: boolean; requests: unknown[] }>(
      `/viewing-requests${status ? `?status=${status}` : ""}`,
    ),

  getSent: () =>
    apiFetch<{ success: boolean; requests: unknown[] }>("/viewing-requests?scope=sent"),

  updateStatus: (id: string, status: string) =>
    apiFetch<{ success: boolean; request: unknown }>(`/viewing-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Public stats + contact reveal
export const publicApi = {
  stats: () =>
    apiFetch<{
      success: boolean;
      total: number;
      byType: Record<string, number>;
      byCity: Record<string, number>;
    }>("/properties/stats"),

  revealContact: (propertyId: string) =>
    apiFetch<{ success: boolean; contact: { name: string; phone: string | null } }>(
      `/properties/${propertyId}/contact`,
      { method: "POST" },
    ),
};

// Admin API
export interface AdminStats {
  listings: Record<string, number>;
  users: { total: number; week: number; blocked: number };
  leads: { total: number; week: number; open: number };
  viewings: { total: number; open: number };
  eventsWeek: Record<string, number>;
  recentActions: {
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    reason: string | null;
    createdAt: string;
    adminName: string | null;
  }[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
}

export const adminApi = {
  stats: () => apiFetch<{ success: boolean } & AdminStats>("/admin/stats"),

  queue: (status = "pending", page = 1) =>
    apiFetch<{ success: boolean; properties: unknown[]; pagination: unknown }>(
      `/admin/properties?status=${status}&page=${page}`,
    ),

  moderate: (data: {
    propertyId: string;
    action: "approve" | "reject" | "archive";
    reason?: string;
  }) =>
    apiFetch<{ success: boolean; message: string }>("/admin/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  users: (search = "", page = 1) =>
    apiFetch<{
      success: boolean;
      users: unknown[];
      pagination: { total: number; page: number; limit: number };
    }>(`/admin/users?search=${encodeURIComponent(search)}&page=${page}`),

  userAction: (data: { userId: string; action: "block" | "unblock"; reason?: string }) =>
    apiFetch<{ success: boolean }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
