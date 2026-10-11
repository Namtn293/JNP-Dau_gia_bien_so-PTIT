import useWindowSize from "@/shared/hooks/useWindowSize";
import {
  AuthWrapper,
  ContentOverlay,
  StyledContentArea,
} from "@apps/auth/styled";
import { Outlet } from "@tanstack/react-router";
import MobileBlocking from "./MobileBlocking";

export default function AuthLayout() {
  const { width, height } = useWindowSize();

  // Kiểm tra thiết bị di động dựa trên cả chiều rộng và chiều cao (để chặn mobile xoay ngang)
  // width < 768: Mobile portrait / Tablet nhỏ
  // height < 500: Mobile landscape (xoay ngang thường có chiều cao rất thấp)
  const isMobile =
    width !== undefined &&
    height !== undefined &&
    (width < 768 || height < 500);

  if (isMobile) {
    return <MobileBlocking />;
  }

  return (
    <AuthWrapper>
      <ContentOverlay style={{ justifyContent: "center", alignItems: "center" }}>
        {/* Chỉ hiển thị form đăng nhập */}
        <StyledContentArea style={{ padding: 0 }}>
          <Outlet />
        </StyledContentArea>
      </ContentOverlay>
    </AuthWrapper>
  );
}
