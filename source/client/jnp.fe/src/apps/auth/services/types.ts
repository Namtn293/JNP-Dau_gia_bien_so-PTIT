/**
 * Form data từ UI (giữ nguyên để không phải sửa form)
 */
export type TLoginRequestAdmin = {
  tenDangNhap: string;
  matKhau: string;
};
export type TLoginRequestNhaDauTu = {
  account: string;
  password: string;
};
/**
 * Payload gửi lên API BE (theo Swagger: canCuocCongDan, matKhau)
 */
export type TLoginApiPayload = {
  canCuocCongDan: string;
  matKhau: string;
};

export interface IRole {
  roleId: number;
  roleName: string;
  idDonvi: number;
  chucvu: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  roles: IRole[];
  idDơnVi: number;
  tenDonVi: string;
}

/**
 * Response từ API đăng nhập theo Swagger
 * Structure: { accessToken, accessExpiresAt, refreshToken, refreshExpiresAt, metaData }
 */
export interface ILoginRespone {
  accessToken: string;
  accessExpiresAt: string;
  roles:string[];
  refreshToken: string;
  refreshExpiresAt: string;
  metaData: any;
}
