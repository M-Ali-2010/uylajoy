"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Resolves the persisted session once per page load. Renders nothing. */
export function AuthBootstrap() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);
  return null;
}
