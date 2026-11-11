import adminRoute from "@apps/admin/Route";
import adminMonitorRoute from "@/apps/admin-monitor/route";
import authdRoute from "@apps/auth/Route";
import dashboardRoute from "@apps/dashboard/Route";
import { auctionRoomRoute, auctionRoomGeneralRoute } from "@/apps/auction-room/route";
import profileRoute from "@/apps/profile/route";
import NotFound404 from "@shared/components/404";
import { createRouter } from "@tanstack/react-router";

import { rootRoute } from "./rootRoute";
export { rootRoute };

export const routeTree = rootRoute.addChildren([
  dashboardRoute,
  auctionRoomRoute,
  auctionRoomGeneralRoute,
  profileRoute,
  adminMonitorRoute,
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
