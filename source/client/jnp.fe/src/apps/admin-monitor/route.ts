import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/Route";
import AdminMonitorPage from "./index";

export const adminMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quan-tri",
  component: AdminMonitorPage,
});

export default adminMonitorRoute;

