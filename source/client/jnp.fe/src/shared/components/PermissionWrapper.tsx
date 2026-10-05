import React from 'react';
import { useGetPermision } from '@shared/hooks/useGetPermision';

interface PermissionWrapperProps {
  module: string; // Tên nhóm quyền (vd: "Quản lý khu công nghiệp")
  action: string; // Mã quyền (vd: "QL001")
  children: React.ReactNode;
  fallback?: React.ReactNode; // UI thay thế khi không có quyền, mặc định là null
}

/**
 * Component tái sử dụng để bọc các phần tử UI cần phân quyền (Nút Thêm, Sửa, Xóa...)
 * 
 * Cách dùng:
 * <PermissionWrapper module={PERMISSION_GROUP.QUAN_LY_KHU_CONG_NGHIEP} action={PERMISSIONS_DETAIL.THEM}>
 *   <Button>Thêm Mới</Button>
 * </PermissionWrapper>
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({ 
  module, 
  action, 
  children,
  fallback = null 
}) => {
  const { isGrant, permisionArr } = useGetPermision(module);

  const granted = isGrant(action);
  if (!granted) {
    console.warn(`[Permission] Chặn hiển thị UI. Nhóm: '${module}', Cần quyền: '${action}', Các quyền hiện có:`, permisionArr);
  }

  // Nếu người dùng có quyền, render children, ngược lại render fallback
  if (granted) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionWrapper;
