import { rootRoute } from "@/Route";
import AuthLogin from "@apps/auth/components/AuthLogin";
import loginRoute from "@apps/auth/pages/login/Route";
import { createRoute } from "@tanstack/react-router";

const AUTH_LAYOUT = "_authLayout";
export const authdRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: AUTH_LAYOUT,
  component: AuthLogin,
});

authdRoute.addChildren([loginRoute]);

export default authdRoute;

