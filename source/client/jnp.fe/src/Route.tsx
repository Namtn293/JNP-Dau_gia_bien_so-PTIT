import adminRoute from "@apps/admin/Route";
import authdRoute from "@apps/auth/Route";
import dashboardRoute from "@apps/dashboard/Route";
import NotFound404 from "@shared/components/404";
import { createRouter } from "@tanstack/react-router";

import { rootRoute } from "./rootRoute";
export { rootRoute };

export const routeTree = rootRoute.addChildren([
  dashboardRoute,
  authdRoute,
  adminRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
  defaultNotFoundComponent: NotFound404,
});

export default router;
