import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/Route";
import ProfilePage from "./index";

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

export default profileRoute;

