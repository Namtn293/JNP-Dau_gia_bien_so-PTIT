export const getCurrentUserName = (userInfo: any): string => {
  const name =
    userInfo?.data?.thongTinTaiKhoan?.hoTen ??
    userInfo?.data?.hoTen ??
    userInfo?.thongTinTaiKhoan?.hoTen ??
    userInfo?.hoTen ??
    "";

  return String(name).trim().toLowerCase();
};

export const hasCurrentUserSigned = (
  tenCanBo: unknown,
  currentUserName: string,
): boolean => {
  if (!currentUserName) return false;
  const tenCanBoList = Array.isArray(tenCanBo) ? tenCanBo : [];
  return tenCanBoList.some(
    (name) => String(name).trim().toLowerCase() === currentUserName,
  );
};
