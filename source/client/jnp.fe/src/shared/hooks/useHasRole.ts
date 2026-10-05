import { useAppContext } from "@shared/context/AppContext";
import { PERMISSION_GROUP, PERMISSIONS_DETAIL } from "@shared/constants/permissions";

/**
 * Tên hook được giữ để tương thích với các màn hiện tại; năng lực nghiệp vụ được xác định hoàn toàn bằng quyền.
 */
export const useHasRole = () => {
  const { permission } = useAppContext();
  const workflowPermissions =
    permission?.quyens?.find(
      (item) => item?.nhomQuyen === PERMISSION_GROUP.QUY_TRINH_BAI_VIET,
    )?.quyens ?? [];

  const isSoanThao = workflowPermissions.includes(
    PERMISSIONS_DETAIL.BIEN_TAP_BAI_VIET,
  );
  const isXuatBan = workflowPermissions.includes(
    PERMISSIONS_DETAIL.DUYET_XUAT_BAN_BAI_VIET,
  );

  return {
    isSoanThao,
    isXuatBan,
  };
};

export default useHasRole;
