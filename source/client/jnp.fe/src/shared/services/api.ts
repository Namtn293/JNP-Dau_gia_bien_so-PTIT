import type { MenuItem, IRoleUser } from "@/shared/services/type";
import type {
  IResponse,
  IResponsePagination,
} from "@/shared/types/response.type";
import axiosClient from "@configs/axios";
import { objectToFormData, stringtifyQuery } from "@shared/utils";
import tokenManager from "@utils/tokenManager";
import { SERVICE_ADMIN_PREFIX } from "@/shared/constants";

const BASE_PATH = `${SERVICE_ADMIN_PREFIX}`;
const BASE_PATH_UPLOAD = `${SERVICE_ADMIN_PREFIX}/UploadFile`;

/** Lấy thông tin user */
export const getUserInfo = () => {
  const accessToken = tokenManager.getAccessToken();
  if (!accessToken) return;

  const url = `${BASE_PATH}/v1/auth/user/info`;
  return axiosClient.get(url);
};
/** Lấy menu user */
export const getMenuUser = async (): Promise<IResponse<MenuItem[]>> => {
  const res = await axiosClient.get<IResponse<MenuItem[]>>(
    `${BASE_PATH}/Menu/lay-menu-theo-nguoi-dung`,
  );
  return res.data;
};

/** Single Upload  File */
export const singleUploadFile = (payload: any): Promise<IResponse<string>> => {
  const url = `${BASE_PATH_UPLOAD}/single`;
  return axiosClient.post(url, objectToFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Check File Signature */
export const checkFileSignature = (file: File): Promise<IResponse<boolean>> => {
  const url = `${SERVICE_ADMIN_PREFIX}/UploadFile/check-signature`;
  return axiosClient.post(url, objectToFormData({ file }), {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Multi Upload File */
export const multiUploadFile = (payload: any): Promise<IResponse<string[]>> => {
  const url = `${BASE_PATH_UPLOAD}/multiple`;
  return axiosClient.post(url, objectToFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
/** Multi Upload File directly using FormData to allow Axios boundary auto-generation */
export const multiUploadFormData = (
  formData: FormData,
): Promise<IResponse<string[]>> => {
  const url = `${SERVICE_ADMIN_PREFIX}/UploadFile/multiple`;
  return axiosClient.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
/** Xóa file */
export const deleteFile = (payload: any): Promise<IResponse<boolean>> => {
  const params = stringtifyQuery(payload);
  const url = `${BASE_PATH_UPLOAD}?${params}`;
  return axiosClient.delete(url);
};
/** Download file bằng path */
export const downloadFile = (payload: { objectName: string }) => {
  const params = stringtifyQuery(payload);
  const url = `${BASE_PATH_UPLOAD}/download?${params}`;

  return axiosClient.get(url, {
    responseType: "arraybuffer", // QUAN TRỌNG
  });
};

export const exportDuThaoTemplate = (body: any) => {
  return axiosClient.post(`${BASE_PATH}/eform/hoso/duthao`, body);
};

export const getDsQuyenUser = (): Promise<IResponse<IRoleUser>> => {
  return axiosClient.get(`${BASE_PATH}/NhomQuyen/quyen-nguoi-dung`);
};

export const getCountryPhoneCodes = (): Promise<
  IResponsePagination<Record<string, string>>
> => {
  return axiosClient.get(
    `${SERVICE_ADMIN_PREFIX}/QuocGia/lay-danh-sach-ma-dien-thoai`,
  );
};
