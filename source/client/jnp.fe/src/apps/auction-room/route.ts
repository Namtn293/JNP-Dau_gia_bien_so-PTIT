import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/Route";
import AuctionRoomPage from "./index";

export const auctionRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/phong-dau-gia/$roomId",
  component: AuctionRoomPage,
});

export const auctionRoomGeneralRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/phong-dau-gia",
  component: AuctionRoomPage,
});

export default auctionRoomRoute;
