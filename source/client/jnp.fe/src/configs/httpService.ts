import { objectToFormData, stringtifyQuery } from '@shared/utils';
import type { AxiosInstance, AxiosResponse } from 'axios';

import type { IAxiosRequestConfigWithRawResponse } from './axios';
import { axiosAIClient, axiosClient, axiosNewsClient, axiosReportClient } from './axios';

/**
 * Lớp gọi API chung.
 *
 * Toàn bộ xử lý lỗi/refresh token/notification/unwrap `response.data` vẫn do
 * interceptor ở `axios.ts` đảm nhiệm. Class này KHÔNG thêm try/catch — chỉ chuẩn
 * hóa cách gọi (params dạng object, upload/download) và kiểu trả về.
 *
 * Vì interceptor trả thẳng `response.data`, generic `T` ở mỗi method là payload
 * ĐÃ unwrap (ví dụ `IResponse<...>` / `IResponsePagination<...>`), nên nơi gọi
 * không cần ép kiểu thủ công nữa.
 */

/** Tham số query dạng object — sẽ được stringtifyQuery (hỗ trợ object lồng `.`) */
export type QueryParams = Record<string, unknown>;

/** Config truyền thẳng xuống axios (giữ nguyên `rawResponse`, custom headers…) */
export type RequestConfig = IAxiosRequestConfigWithRawResponse;

export interface IHttpService {
  get<T>(url: string, params?: QueryParams, config?: RequestConfig): Promise<T>;
  post<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, params?: QueryParams, config?: RequestConfig): Promise<T>;
  postForm<T>(url: string, data: object | FormData, config?: RequestConfig): Promise<T>;
  download(
    url: string,
    params?: QueryParams,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ArrayBuffer>>;
}

/** Nối query string vào url, tự chọn separator `?`/`&` */
const withQuery = (url: string, params?: QueryParams): string => {
  if (!params) return url;
  const query = stringtifyQuery(params);
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
};

export class HttpService implements IHttpService {
  private readonly instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  get<T>(url: string, params?: QueryParams, config?: RequestConfig): Promise<T> {
    return this.instance.get(withQuery(url, params), config) as unknown as Promise<T>;
  }

  post<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, body, config) as unknown as Promise<T>;
  }

  put<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, body, config) as unknown as Promise<T>;
  }

  patch<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.instance.patch(url, body, config) as unknown as Promise<T>;
  }

  delete<T>(url: string, params?: QueryParams, config?: RequestConfig): Promise<T> {
    return this.instance.delete(withQuery(url, params), config) as unknown as Promise<T>;
  }

  /**
   * Upload multipart. Nhận object (tự `objectToFormData`) hoặc `FormData` sẵn.
   * Với `FormData` truyền thẳng, KHÔNG set cứng Content-Type để axios tự sinh
   * boundary chính xác.
   */
  postForm<T>(url: string, data: object | FormData, config?: RequestConfig): Promise<T> {
    const isFormData = data instanceof FormData;
    const formData = isFormData ? data : objectToFormData(data);
    const finalConfig: RequestConfig = isFormData
      ? { ...config }
      : {
          ...config,
          headers: { 'Content-Type': 'multipart/form-data', ...config?.headers },
        };
    return this.instance.post(url, formData, finalConfig) as unknown as Promise<T>;
  }

  /**
   * Tải file. Trả nguyên `AxiosResponse` (qua `rawResponse`) với body dạng
   * arraybuffer để nơi gọi đọc `res.data`.
   */
  download(
    url: string,
    params?: QueryParams,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ArrayBuffer>> {
    const finalConfig: RequestConfig = {
      responseType: 'arraybuffer',
      rawResponse: true,
      ...config,
    };
    return this.instance.get(
      withQuery(url, params),
      finalConfig,
    ) as unknown as Promise<AxiosResponse<ArrayBuffer>>;
  }
}

/** Nối Dịch Vụ Công (baseURL mặc định) */
export const httpService = new HttpService(axiosClient);
/** Nối Tin Tức */
export const newsHttpService = new HttpService(axiosNewsClient);
/** Nối Kho tri thức AI */
export const aiHttpService = new HttpService(axiosAIClient);
/** Nối Báo cáo thống kê */
export const reportHttpService = new HttpService(axiosReportClient);
