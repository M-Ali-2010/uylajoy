"use client";

import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Client-side gate for account pages. Auth lives in a bearer token in the
 * browser, so the server cannot decide this during SSR; the page renders a
 * neutral shell until the session check resolves, then either shows the
 * content or sends the visitor to the login page (and back afterwards).
 *
 * This protects the UI only. Every API route checks the session itself.
 */
export function RequireAuth({ role, children }: { role?: "admin"; children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isLoading, isAuthenticated } = useAuthStore();

  const allowed = isAuthenticated && (!role || user?.role === role);

  // The guard stays mounted while the router transitions away, so remember
  // where the visitor was going and redirect exactly once.
  const target = useRef(pathname);
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading || redirected.current) return;
    if (!isAuthenticated) {
      redirected.current = true;
      navigate({ to: "/kirish", search: { redirect: target.current }, replace: true });
    } else if (!allowed) {
      redirected.current = true;
      navigate({ to: "/", replace: true });
    }
  }, [isLoading, isAuthenticated, allowed, navigate]);

  if (isLoading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" aria-busy="true">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
