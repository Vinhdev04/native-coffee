/**
 * @file permissionUtils.ts
 * @desc Kiểm tra quyền truy cập — so sánh router_screen của user
 *       với danh sách PERMISSIONS và xác định vai trò admin.
 * @layer utils
 */

import { UserDetail } from '@/pages/auth/types';

/**
 * Danh sách permissions key của hệ thống
 */
export const PERMISSIONS = {
  MENU_VIEW:      '/menu/view',
  ORDER_CREATE:   '/order/create',
  ORDER_MANAGE:   '/order/manage',
  REPORT_VIEW:    '/report/view',
  ADMIN_ACCESS:   '/admin',
};

/**
 * Kiểm tra người dùng có quyền truy cập vào một route không
 */
export const hasPermission = (user: UserDetail | null, permissionPath: string): boolean => {
  if (!user) return false;
  const rawPermissions = user.permissions || [];
  const activePaths = rawPermissions.map((p: any) =>
    typeof p === 'string' ? p : p.router_screen
  );
  return activePaths.includes(permissionPath);
};

/**
 * Kiểm tra user có phải admin không
 */
export const isAdmin = (user: UserDetail | null): boolean => {
  return user?.role === 'admin' || user?.role === 'ADMIN';
};
