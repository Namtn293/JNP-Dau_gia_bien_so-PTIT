import { authdRoute } from "@apps/auth/Route";
import { GOOGLE_CALLBACK_ROUTE } from "@/constants";
import GoogleCallbackPage from "./index";
import { createRoute } from "@tanstack/react-router";

export const googleCallbackRoute = createRoute({
  getParentRoute: () => authdRoute,
  path: GOOGLE_CALLBACK_ROUTE,
  component: GoogleCallbackPage,
});

export default googleCallbackRoute;
