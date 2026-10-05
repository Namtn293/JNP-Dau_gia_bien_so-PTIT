import { createRoute } from "@tanstack/react-router";
import { uyQuyenTaiKhoanRoute } from "@/apps/uy-quyen-tai-khoan/Route";
import ThongBaoPage from ".";

export const QUAN_LY_THONG_BAO_ROUTE = "quan-ly-thong-bao";

const quanLyThongBaoRoute = createRoute({
  getParentRoute: () => uyQuyenTaiKhoanRoute,
  path: QUAN_LY_THONG_BAO_ROUTE,
  component: ThongBaoPage,
});

export default quanLyThongBaoRoute;
