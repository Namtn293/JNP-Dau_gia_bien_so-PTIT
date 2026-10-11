/**
 * Hook dùng chung để map idNguoiTao / idNguoiSua → hoTen.
 * Đã gỡ bỏ API QuanLyNguoiDung cũ để tránh gọi endpoint không tồn tại.
 */
export const useUserNameById = () => {
  const getUserName = (id?: string | number): string | undefined => {
    if (id === undefined || id === null || id === "") return undefined;
    return undefined;
  };

  return { getUserName };
};

export default useUserNameById;

