import { ADMIN_LOGIN_ROUTE, REFRESH_TOKEN_URL } from '@/constants';
import type { IOriginRequest } from '@configs/axios';
import axiosClient from '@configs/axios';
import axios from 'axios';
import tokenManager from './tokenManager';
import { SERVICE_ADMIN_PREFIX } from '@/shared/constants';

const BASE_PATH = `${SERVICE_ADMIN_PREFIX}/`;
interface IFailedQueue {
  resolve: Promise<any>;
  reject: Promise<any>;
}

// for multiple requests
let isRefreshing = false;
let failedQueue: IFailedQueue[] = [];

const processQueue = (error: Error | null, token = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const handleRefreshToken = async (originalRequest: IOriginRequest) => {
  if (isRefreshing) {
    return new Promise(function (resolve: any, reject: any) {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = 'Bearer ' + token;
        }
        return axiosClient(originalRequest);
      })
      .catch((err) => err);
  }

  originalRequest._retry = true;
  isRefreshing = true;

  return new Promise(function (resolve, reject) {
    const refreshToken = tokenManager.getRefreshToken();

    if (refreshToken) {
      axios
        .post(
          `${import.meta.env.VITE_API_URL}${BASE_PATH}${REFRESH_TOKEN_URL}`,
          JSON.stringify({ refreshToken }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        .then(({ data }:any) => {
          //Trường hợp refresh token hết hạn đẩy về trang đăng nhập
          if (!data?.data) {
            tokenManager.removeAccessToken();
            tokenManager.removeRefreshToken();
            window.location.href = ADMIN_LOGIN_ROUTE;
            return;
          }

          tokenManager.setAccessToken(data.data.accessToken);
          tokenManager.setRefreshToken(data.data.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + data.data.accessToken;
          }

          processQueue(null, data.data.accessToken);
          resolve(axiosClient(originalRequest));
        })
        .then(() => {
          isRefreshing = false;
        })
        .catch((err:any) => {
          console.log('refresh token err: ', err);
          tokenManager.removeAccessToken();
          tokenManager.removeRefreshToken();
          window.location.href = ADMIN_LOGIN_ROUTE;
          processQueue(err, null);
          reject(err);
        });
    }
  });
};