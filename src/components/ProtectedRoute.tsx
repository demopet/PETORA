import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { hasPermission } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

function getDashboardForRole(role: UserRole): string {
  if (role === "CUSTOMER") return "/portal";
  return "/dashboard";
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === "CUSTOMER") {
    return <Navigate to="/portal" replace />;
  }

  if (requiredRole && !hasPermission(user.role, requiredRole)) {
    return (
      <Navigate to={redirectTo ?? getDashboardForRole(user.role)} replace />
    );
  }

  return <>{children}</>;
}
