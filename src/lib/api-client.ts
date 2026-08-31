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

// Base fetch with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string; role?: string }) =>
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

  getMe: () =>
    apiFetch<{ success: boolean; user: unknown }>("/auth/me"),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string; language?: string; currency?: string }) =>
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
  type?: string;
  dealType?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  condition?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
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
      `/properties?${params.toString()}`
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

  getFolders: () =>
    apiFetch<{ success: boolean; folders: unknown[] }>("/favorites/folders"),

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
  create: (data: { propertyId: string; name: string; phone: string; email?: string; message?: string }) =>
    apiFetch<{ success: boolean; lead: unknown; message: string }>("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (options: { status?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return apiFetch<{ success: boolean; leads: unknown[]; pagination: unknown }>(`/leads?${params.toString()}`);
  },

  getStats: () =>
    apiFetch<{ success: boolean; stats: unknown }>("/leads?stats=true"),

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
    return apiFetch<{ success: boolean; notifications: unknown[]; pagination: unknown; unreadCount: number }>(
      `/notifications?${params.toString()}`
    );
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

  create: (data: { propertyId: string; provider: "payme" | "click"; paymentType: string; duration?: string }) =>
    apiFetch<{ success: boolean; payment: unknown; paymentUrl: string }>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiFetch<{ success: boolean; payments: unknown[] }>("/payments"),

  getById: (id: string) =>
    apiFetch<{ success: boolean; payment: unknown }>(`/payments?id=${id}`),
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
