"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  /**
   * Override login destination. Defaults to
   * `/login?redirect=<current pathname>`.
   */
  redirectTo?: string;
  fallback?: ReactNode;
};

function buildLoginRedirect(pathname: string): string {
  const safePath =
    pathname && pathname.startsWith("/") && !pathname.startsWith("//")
      ? pathname
      : "/";
  return `/login?redirect=${encodeURIComponent(safePath)}`;
}

/**
 * Client-side route guard. Requires AuthProvider.
 */
export function ProtectedRoute({
  children,
  redirectTo,
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-[#0f2c4c] text-white font-black italic text-3xl animate-pulse">
      Loading...
    </div>
  ),
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(redirectTo ?? buildLoginRedirect(pathname));
    }
  }, [loading, isAuthenticated, redirectTo, pathname, router]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
