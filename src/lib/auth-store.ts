import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, setAuthToken, getAuthToken } from "./api-client";

export interface User {
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

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const { user, token } = response;

        setAuthToken(token);
        set({
          user: user as User,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: async (data) => {
        const response = await authApi.register(data);
        const { user, token } = response;

        setAuthToken(token);
        set({
          user: user as User,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore errors during logout
        }

        setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const token = getAuthToken();

        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          setAuthToken(token);
          const response = await authApi.getMe();
          set({
            user: response.user as User,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          setAuthToken(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
