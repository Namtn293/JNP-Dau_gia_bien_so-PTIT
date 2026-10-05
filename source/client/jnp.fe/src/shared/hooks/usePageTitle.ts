import { useLocation, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";

export const usePageTitle = () => {
  const matches = useMatches();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (
      path.includes("/quan-ly-danh-muc") ||
      path.includes("/quan-tri-tai-khoan") ||
      path.includes("/quan-ly-danh-muc-du-lieu")
      
    ) {
      document.title = "QUẢN TRỊ HỆ THỐNG";
      return;
    }

    if (path.includes("/quan-ly-bai-viet")) {
      document.title = "QUẢN TRỊ TRANG TIN";
      return;
    }

    if (
      path.includes("/xu-ly-ho-so") ||
      path.includes("/danh-sach-cho-tiep-nhan-truc-tuyen") ||
      path.includes("/tiep-nhan-truc-tiep") ||
      path.includes("/ho-so-dang-tiep-nhan") ||
      path.includes("/danh-sach-ho-so-yeu-cau-bo-sung") ||
      path.includes("/danh-sach-cho-bo-sung-cho-tiep-nhan") ||
      path.includes("/danh-sach-ho-so-da-tiep-nhan") ||
      path.includes("/danh-sach-tu-choi-tiep-nhan-truc-tuyen") ||
      path.includes("/dich-vu-cong") ||
      path.includes("/hen-nop-ho-so-truc-tiep") ||
      path.includes("/tra-cuu") ||
      path.includes("/sau-tiep-nhan") ||
      path.includes("/bao-cao-thong-ke")
    ) {
      document.title = "SÀN ĐẤU GIÁ BIỂN SỐ XE";
      return;
    }

    const matchWithTitle = [...matches]
      .reverse()
      .find((match) => (match.staticData as any)?.title);
    const pageTitle = (matchWithTitle?.staticData as any)?.title;

    //  dùng để xử bắt các  staticData ở các router định nghĩa
    document.title = pageTitle || "SÀN ĐẤU GIÁ BIỂN SỐ XE";
  }, [matches, location.pathname]);
};
