"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { usePathname } from "next/navigation";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, isInitialized } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Public routes should always render immediately to avoid blocking login/register
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!isInitialized && !isPublicRoute) {
    return null; // Ensure we only block rendering for protected content
  }

  return <>{children}</>;
}
