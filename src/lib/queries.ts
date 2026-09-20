"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  favoritesApi,
  leadsApi,
  notificationsApi,
  propertiesApi,
  publicApi,
  viewingApi,
} from "./api-client";
import { useAuthStore } from "./auth-store";
import {
  toApiFilters,
  toListing,
  type ApiProperty,
  type Listing,
  type ListingSearch,
} from "./listing";

/**
 * The single data layer for server state. Components never call fetch;
 * they ask for a hook. Every listing that comes back is already a `Listing`.
 */

export const queryKeys = {
  listings: (search: ListingSearch) => ["listings", search] as const,
  listing: (id: string) => ["listing", id] as const,
  featured: ["featured"] as const,
  recent: ["recent"] as const,
  stats: ["stats"] as const,
  favorites: ["favorites"] as const,
  myListings: (status?: string) => ["my-listings", status ?? "all"] as const,
  leads: ["leads"] as const,
  viewings: (scope: "owner" | "sent") => ["viewings", scope] as const,
  moderation: (status: string, page: number) => ["moderation", status, page] as const,
  adminUsers: (search: string, page: number) => ["admin-users", search, page] as const,
  notifications: (unreadOnly: boolean) => ["notifications", unreadOnly] as const,
};

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useListings(search: ListingSearch) {
  return useQuery({
    queryKey: queryKeys.listings(search),
    queryFn: async () => {
      const res = await propertiesApi.getAll(toApiFilters(search));
      return {
        listings: (res.properties as ApiProperty[]).map(toListing),
        pagination: res.pagination as Pagination,
      };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: async () => {
      const res = await propertiesApi.getById(id);
      return {
        listing: toListing(res.property as ApiProperty),
        similar: (res.similar as ApiProperty[]).map(toListing),
      };
    },
    staleTime: 60_000,
    retry: (count, error) =>
      !(error instanceof Error && /not found/i.test(error.message)) && count < 2,
  });
}

export function useFeatured(limit = 3) {
  return useQuery({
    queryKey: [...queryKeys.featured, limit],
    queryFn: async () => (await propertiesApi.getFeatured(limit)).properties as ApiProperty[],
    select: (rows) => rows.map(toListing),
    staleTime: 60_000,
  });
}

export function useRecent(limit = 6) {
  return useQuery({
    queryKey: [...queryKeys.recent, limit],
    queryFn: async () =>
      (await propertiesApi.getAll({ sortBy: "newest", limit })).properties as ApiProperty[],
    select: (rows) => rows.map(toListing),
    staleTime: 60_000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => publicApi.stats(),
    staleTime: 5 * 60_000,
  });
}

// --- favourites --------------------------------------------------------------

export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: async () => {
      const res = await favoritesApi.getAll();
      return (res.favorites as { id: string; property: ApiProperty }[]).map((f) => ({
        id: f.id,
        listing: toListing(f.property),
      }));
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useFavoriteIds(): Set<string> {
  const { data } = useFavorites();
  return new Set(data?.map((f) => f.listing.id) ?? []);
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      if (saved) await favoritesApi.remove(id);
      else await favoritesApi.add(id);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.favorites }),
  });
}

// --- contact & requests ------------------------------------------------------

export function useRevealContact() {
  return useMutation({ mutationFn: (id: string) => publicApi.revealContact(id) });
}

export function useCreateLead() {
  return useMutation({ mutationFn: leadsApi.create });
}

export function useCreateViewing() {
  return useMutation({ mutationFn: viewingApi.create });
}

// --- owner / dashboard -------------------------------------------------------

export function useMyListings(status?: string) {
  return useQuery({
    queryKey: queryKeys.myListings(status),
    queryFn: async () => {
      const res = await propertiesApi.getAll({
        mine: "1",
        limit: 50,
        ...(status ? { status } : {}),
      });
      return (res.properties as ApiProperty[]).map(toListing);
    },
    staleTime: 15_000,
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      propertiesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["listing"] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-listings"] }),
  });
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: "new" | "contacted" | "qualified" | "closed";
  createdAt: string;
  property?: { id: string; title: string } | null;
}

export function useLeads() {
  return useQuery({
    queryKey: queryKeys.leads,
    queryFn: async () => (await leadsApi.getAll({ limit: 50 })).leads as Lead[],
    staleTime: 15_000,
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead["status"] }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.leads }),
  });
}

export interface ViewingRequest {
  id: string;
  name: string;
  phone: string;
  preferredAt: string;
  message: string | null;
  status: "new" | "confirmed" | "declined" | "done";
  createdAt: string;
  property: { id: string; title: string; city: string; district: string; cover?: string | null };
}

export function useViewingRequests(scope: "owner" | "sent" = "owner") {
  return useQuery({
    queryKey: queryKeys.viewings(scope),
    queryFn: async () =>
      (scope === "sent" ? await viewingApi.getSent() : await viewingApi.getForOwner())
        .requests as ViewingRequest[],
    staleTime: 15_000,
  });
}

export function useUpdateViewingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ViewingRequest["status"] }) =>
      viewingApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["viewings"] }),
  });
}

// --- notifications -----------------------------------------------------------

export type NotificationType =
  "message" | "lead" | "listing_approved" | "listing_rejected" | "price_drop" | "review" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * The inbox. The bell in the header and the notifications page share the
 * `unreadOnly: false` cache entry, so opening the page costs no extra request
 * and marking one read updates the badge in the same tick.
 */
export function useNotifications(unreadOnly = false) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.notifications(unreadOnly),
    queryFn: async () => {
      const res = await notificationsApi.getAll({ limit: 50, unreadOnly });
      return {
        notifications: res.notifications as AppNotification[],
        unreadCount: res.unreadCount,
      };
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    // The badge would otherwise sit stale for as long as the tab stays open.
    refetchInterval: 2 * 60_000,
    refetchOnWindowFocus: true,
  });
}

/** Just the badge number — zero when signed out or still loading. */
export function useUnreadNotificationCount(): number {
  const { data } = useNotifications(false);
  return data?.unreadCount ?? 0;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// --- admin -------------------------------------------------------------------

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useModerationQueue(status = "pending", page = 1) {
  return useQuery({
    queryKey: queryKeys.moderation(status, page),
    queryFn: async () => {
      const res = await adminApi.queue(status, page);
      return {
        listings: (res.properties as ApiProperty[]).map(toListing),
        pagination: res.pagination as Pagination,
      };
    },
    staleTime: 10_000,
  });
}

export function useModerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.moderate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation"] });
      qc.invalidateQueries({ queryKey: queryKeys.stats });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  listings: number;
}

export function useAdminUsers(search = "", page = 1) {
  return useQuery({
    queryKey: queryKeys.adminUsers(search, page),
    queryFn: async () => {
      const res = await adminApi.users(search, page);
      return { users: res.users as AdminUser[], pagination: res.pagination };
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });
}

export function useUserAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.userAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export type { Listing };
