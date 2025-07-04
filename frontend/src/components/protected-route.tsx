"use client";

import type React from "react";
import { useAuth } from "../contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: ("client" | "motivator" | "admin")[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // If user is authenticated, check authorization
    if (isAuthenticated && user) {
      // Check role-based access if specified
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }

      // If already on the correct dashboard, don't redirect again
      const dashboardPath = `/${user.role}/dashboard`;
      if (pathname.startsWith(`/${user.role}`)) {
        setIsAuthorized(true);
        return;
      }

      setIsAuthorized(true);
      return;
    }

    // If not authenticated, check localStorage as fallback
    if (!isAuthenticated && !user) {
      const userData = localStorage.getItem("userData") || localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (!userData || !token) {
        router.push("/login");
        return;
      }

      try {
        const storedUser = JSON.parse(userData);
        const role = storedUser?.role;

        // Check role-based access if specified
        if (allowedRoles && (!role || !allowedRoles.includes(role))) {
          router.push("/unauthorized");
          return;
        }

        // If already on the correct dashboard, don't redirect again
        const dashboardPath = `/${role}/dashboard`;
        if (pathname.startsWith(`/${role}`)) {
          setIsAuthorized(true);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error parsing user data: ", error);
        router.push("/login");
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, pathname, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
