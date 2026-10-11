import { rootRoute } from "@/Route";
import AdminLayout from "@/apps/admin/components/AdminLayout";
import { createRoute } from "@tanstack/react-router";

const ADMIN_LAYOUT = "_adminLayout";
export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: ADMIN_LAYOUT,
  component: AdminLayout,
});

export default adminRoute;

