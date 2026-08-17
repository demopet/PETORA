import { UserRole } from '@/types/user';

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isOwner = (userRole: UserRole): boolean => {
  return userRole === 'OWNER';
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'OWNER' || userRole === 'ADMIN';
};

export const isStaff = (userRole: UserRole): boolean => {
  return ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'].includes(userRole);
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === 'OWNER';
};

export const canCreateStaff = (userRole: UserRole): boolean => {
  return userRole === 'OWNER';
};

export const canCreateCustomer = (userRole: UserRole): boolean => {
  return userRole === 'OWNER' || userRole === 'ADMIN';
};

export const canManageProducts = (userRole: UserRole): boolean => {
  return userRole === 'OWNER' || userRole === 'ADMIN';
};

export const canManageInventory = (userRole: UserRole): boolean => {
  return userRole === 'OWNER' || userRole === 'ADMIN';
};

export const canManagePOS = (userRole: UserRole): boolean => {
  return userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'KASIR';
};

export const canManageFinance = (userRole: UserRole): boolean => {
  return userRole === 'OWNER' || userRole === 'ADMIN';
};

export const canViewReports = (userRole: UserRole): boolean => {
  return ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'].includes(userRole);
};
