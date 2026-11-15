import {
  ADMIN_LOGIN_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  GOOGLE_CALLBACK_ROUTE,
  LOGIN_CAN_BO_ROUTE,
} from "@/constants";
import tokenManager from "@/shared/utils/tokenManager";
import { isJwtExpired } from "@/shared/utils/jwt";
import NotFound404 from "@shared/components/404";
import {
  Outlet,
  createRootRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { App } from "antd";
import { useEffect } from "react";
import ErrorFallback from "~/shared/components/error-boundary/ErrorFallback";
import { usePageTitle } from "./shared/hooks/usePageTitle";
import { StompProvider, UserChannels } from "@/shared/realtime";

function RootComponent() {
  usePageTitle();
  const location = useLocation();
  const { notification, message } = App.useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      notification.destroy();
      message.destroy();
    }, 5000);

    return () => clearTimeout(timer);
  }, [location.pathname, notification, message]);

  return (
    <StompProvider>
      <UserChannels />
      <Outlet />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </StompProvider>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,

  beforeLoad: async ({ location }) => {
    const token = tokenManager.getAccessToken();
    const loggedIn = Boolean(token && !isJwtExpired(token));

    const isPublic =
      location.pathname === "/" ||
      location.pathname.startsWith(ADMIN_LOGIN_ROUTE) ||
      location.pathname.startsWith(FORGOT_PASSWORD_ROUTE) ||
      location.pathname.startsWith(LOGIN_CAN_BO_ROUTE) ||
      location.pathname.startsWith(GOOGLE_CALLBACK_ROUTE) ||
      location.pathname.startsWith("/danh-sach-dau-gia") ||
      location.pathname.startsWith("/phong-dau-gia");

    if (location.pathname === "/") {
      throw redirect({
        to: "/danh-sach-dau-gia",
      });
    }

    if (!loggedIn && !isPublic) {
      throw redirect({
        to: ADMIN_LOGIN_ROUTE,
        search: {
          redirect: location.href,
        },
      });
    }

    if (loggedIn && location.pathname === ADMIN_LOGIN_ROUTE) {
      throw redirect({
        to: "/danh-sach-dau-gia",
      });
    }
  },
  errorComponent: (props) => {
    const { error } = props;

    const isChunkLoadError =
      error?.name === "ChunkLoadError" ||
      (error instanceof Error && (
        error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("Importing a module script failed") ||
        error.message.includes("dynamically imported module")
      ));

    if (isChunkLoadError) {
      const currentPath = window.location.pathname;
      const lastChunkErrorPath = window.sessionStorage.getItem('chunkErrorPath');
      if (lastChunkErrorPath !== currentPath) {
        window.sessionStorage.setItem('chunkErrorPath', currentPath);
        window.location.reload();
        return null;
      }
    }

    if (error?.message === "NOT_FOUND") {
      return <NotFound404 />;
    }

    return (
      <ErrorFallback
        error={
          error instanceof Error ? error : new Error("Unknown route error")
        }
        resetErrorBoundary={() => {
          window.sessionStorage.removeItem('chunkErrorPath');
          window.location.reload();
        }}
      />
    );
  },
});
