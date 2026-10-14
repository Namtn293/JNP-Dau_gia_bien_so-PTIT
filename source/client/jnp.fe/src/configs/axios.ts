import { LANGUAGE_REQUEST } from '@constants/index';
import { LOCAL_STORAGE_KEYS } from '@constants/storageKeys';
import { handleRefreshToken } from '@utils/refreshToken';
import { lcStorage } from '@utils/storage';
import tokenManager from '@utils/tokenManager';
import { notification } from 'antd';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { IResponse } from '../shared/types/response.type';


export interface IOriginRequest extends AxiosRequestConfig { _retry: boolean; }
export interface IAxiosRequestConfigWithRawResponse extends AxiosRequestConfig {
  rawResponse?: boolean;
}
const handleRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  const lang: string = lcStorage.get(LOCAL_STORAGE_KEYS.language) || 'vi'
  const langCode = LANGUAGE_REQUEST[lang];
  //check token
  const accessToken = tokenManager.getAccessToken();
  if (accessToken && config.headers) {
    config.headers['Authorization'] = 'Bearer ' + accessToken;
  }
  // (VI) Tạm thời tắt header ngonngu cho các API Quản lý bài viết cho tới khi BE sửa lỗi
  const isArticleApi = config.baseURL === import.meta.env.VITE_ARTICLE_API_URL;
  if (config.headers && !config.headers['ngonngu'] && !config.headers['Ngonngu'] && !isArticleApi) {
    config.headers['ngonngu'] = langCode;
  }
  config.validateStatus = function (status) {
    return (status >= 200 && status < 300) || status === 404; // default
  };

  return config;
};

const handleRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

const handleResponse = (response: AxiosResponse) => {
  if ((response.config as IAxiosRequestConfigWithRawResponse).rawResponse) {
    return response;
  }

  //Trả thẳng về data trong trường hợp là phương thức là GET
  return response.data;
};


const handleResponseError = async (error: AxiosError<IResponse<any>>) => {
  console.log('Request error: ', { error });

  const originalRequest = error.config as IOriginRequest;

  //handle refresh token
  if (error.response?.status === 401 && !originalRequest._retry) {
    return handleRefreshToken(originalRequest);
  }

  //internal server error
  if (error.response?.status === 500) {
    notification.error({
      message: 'Thất bại!',
      description: 'Đã có lỗi xảy ra',
    });
    return Promise.reject(error.response);
  }

  if (error.response?.status === 405) {
    notification.error({
      message: 'Thất bại!',
      description: 'Bạn không có quyền thao tác này.',
    });
    return Promise.reject(error.response);
  }

  //show message error
  const skipGlobalNotify = 
    originalRequest?.headers?.['skip-global-notification'] === 'true' || 
    originalRequest?.headers?.['Skip-Global-Notification'] === 'true' ||
    (typeof originalRequest?.headers?.get === 'function' && originalRequest.headers.get('skip-global-notification') === 'true');
  if (error.response?.status !== 404 && error.response?.status !== 403 && !skipGlobalNotify) {
    const errorData = error.response?.data;
    let desc = error.message;
    if (errorData) {
      if (errorData.messages && Array.isArray(errorData.messages) && errorData.messages.length > 0) {
        desc = errorData.messages.join(', ');
      } else if (errorData.message) {
        desc = errorData.message;
      }
    }

    notification.error({
      message: 'Thất bại!',
      description: desc,
    });
  }

  return Promise.reject(error.response || error);
};

//configs nối DichVuCong
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

//configs nối news
const axiosNewsClient = axios.create({
  baseURL: import.meta.env.VITE_ARTICLE_API_URL,
  timeout: 120000,
  // (VI) Không set Content-Type mặc định — để axios tự detect theo loại body:
  // - JSON body  → axios tự set 'application/json'
  // - FormData   → axios tự set 'multipart/form-data; boundary=...' (đúng boundary)
  // Nếu set cứng 'application/json' ở đây sẽ override boundary của FormData → 400
});

//configs nối Kho tri thức AI
const axiosAIClient = axios.create({
  baseURL: import.meta.env.VITE_API_AI_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});


//configs nối báo cáo thống kê
const axiosReportClient = axios.create({
  baseURL: import.meta.env.VITE_API_REPORT_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Client nối với Báo Cáo Thống Kê
axiosReportClient.interceptors.request.use(handleRequest as any, handleRequestError);
axiosReportClient.interceptors.response.use(handleResponse, handleResponseError);

//Client nối với Tin Tức
axiosNewsClient.interceptors.request.use(handleRequest as any, handleRequestError);
axiosNewsClient.interceptors.response.use(handleResponse, handleResponseError);

// Client nối với DichVuCong
axiosClient.interceptors.request.use(handleRequest as any, handleRequestError);
axiosClient.interceptors.response.use(handleResponse, handleResponseError);

// Client nối với AI
axiosAIClient.interceptors.request.use(handleRequest as any, handleRequestError);
axiosAIClient.interceptors.response.use(handleResponse, handleResponseError);


export default axiosClient;
export { axiosAIClient, axiosClient, axiosNewsClient, axiosReportClient };

