import { LOCAL_STORAGE_KEYS } from '@/constants';
import { lcStorage } from '@/shared/utils';
import { authdRoute } from '@apps/auth/Route';
import { ADMIN_LOGIN_ROUTE } from '@apps/auth/constants';
import LoginPage from './index';
import { createRoute, redirect } from '@tanstack/react-router';

export const loginRoute = createRoute({
  getParentRoute: () => authdRoute,
  path: ADMIN_LOGIN_ROUTE,
  component: LoginPage,
  beforeLoad: () => {
    const accessToken = lcStorage.get<string>(
      LOCAL_STORAGE_KEYS.accessToken
    );

    // Đã login thì không cho vào trang login
    if (accessToken) {
      throw redirect({
        to: '/danh-sach-dau-gia',
      });
    }
  },
});

export default loginRoute;