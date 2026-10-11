import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/Route';
import DashboardPage from './index';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/danh-sach-dau-gia',
  component: DashboardPage,
});

export default dashboardRoute;