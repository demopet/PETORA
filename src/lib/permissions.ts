import { UserRole } from "@/types/user";

export const hasPermission = (
  userRole: UserRole,
  requiredRole: UserRole | UserRole[],
): boolean => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};

export const isOwner = (userRole: UserRole): boolean => {
  return userRole === "OWNER";
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === "OWNER" || userRole === "ADMIN";
};

export const isStaff = (userRole: UserRole): boolean => {
  return ["OWNER", "ADMIN", "DOKTER", "KASIR"].includes(userRole);
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === "OWNER";
};

export const canCreateStaff = (userRole: UserRole): boolean => {
  return userRole === "OWNER";
};

export const canCreateCustomer = (userRole: UserRole): boolean => {
  return userRole === "OWNER" || userRole === "ADMIN";
};

export const canManageProducts = (userRole: UserRole): boolean => {
  return userRole === "OWNER" || userRole === "ADMIN";
};

export const canManageInventory = (userRole: UserRole): boolean => {
  return userRole === "OWNER" || userRole === "ADMIN";
};

export const canManagePOS = (userRole: UserRole): boolean => {
  return userRole === "OWNER" || userRole === "ADMIN" || userRole === "KASIR";
};

export const canManageFinance = (userRole: UserRole): boolean => {
  return userRole === "OWNER" || userRole === "ADMIN";
};

export const canViewReports = (userRole: UserRole): boolean => {
  return ["OWNER", "ADMIN", "DOKTER", "KASIR"].includes(userRole);
};

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const routePermissions: Record<string, UserRole[]> = {
    "/dashboard": ["OWNER", "ADMIN", "DOKTER", "KASIR"],
    "/customers": ["OWNER", "ADMIN", "KASIR"],
    "/pets": ["OWNER", "ADMIN", "DOKTER", "KASIR"],
    "/appointments": ["OWNER", "ADMIN", "DOKTER", "KASIR"],
    "/medical-records": ["OWNER", "ADMIN", "DOKTER"],
    "/pet-hotel": ["OWNER", "ADMIN", "KASIR"],
    "/grooming": ["OWNER", "ADMIN", "KASIR"],
    "/products": ["OWNER", "ADMIN", "KASIR"],
    "/inventory": ["OWNER", "ADMIN"],
    "/purchase-orders": ["OWNER", "ADMIN"],
    "/pos": ["OWNER", "ADMIN", "KASIR"],
    "/invoices": ["OWNER", "ADMIN", "KASIR"],
    "/cash-shifts": ["OWNER", "ADMIN", "KASIR"],
    "/loyalty": ["OWNER", "ADMIN"],
    "/promotions": ["OWNER", "ADMIN"],
    "/expenses": ["OWNER", "ADMIN"],
    "/reports": ["OWNER", "ADMIN"],
    "/settings": ["OWNER", "ADMIN"],
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(userRole);
};
