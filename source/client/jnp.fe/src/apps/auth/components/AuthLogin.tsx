import {
  AuthWrapper,
  ContentOverlay,
  StyledContentArea,
} from "@apps/auth/styled";
import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
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
