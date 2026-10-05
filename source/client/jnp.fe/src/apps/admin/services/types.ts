export type TLoginRequest = {
  account: string;
  password: string;
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

export interface ILoginRespone {
  token: string;
  refreshToken: string;
  user: IUser;
}

export interface CCCDInfo {
  hoTen: string;
  ngaySinh: string;
  noiDangKyKhaiSinh: string;
  queQuan: string;
  noiOHienTai: string;
  canCuocCongDan: string;
  gioiTinh: string;
  quocTich: string;
  thuongTru: string;
  trangThai: string;
}

export interface CCCDCheckResponse {
  success: boolean;
  data?: CCCDInfo;
  message?: string;
}

export interface IHoSo {
  ma: string;
  ten: string;
  hinhThucTiepNhan: boolean;
  dichVuCongId: number;
  thongTinNguoiNopId: number;
  soBoHoSo: string;
  maHoSoTiepNhan: string;
  soDen: string;
  soCongVan: string;
  ngayCongVan: string;
  lePhi: number;
  phiHoSo: number;
  noiDung: string;
  thongTinDuAn: string;
  ngayTiepNhan: string;
  soNgayKiemTraHopLe: number;
  ngayTraLoiTinhHopLe: string;
  soNgayGiaiQuyet: number;
  ngayHenTra: string;
}
export interface Taikhoan {
  taiKhoanId: number;
  tenDangNhap: string;
  ngayTao: string;
  trangThai: boolean;
  thongTinTaiKhoan: ThongTinTaiKhoan;
  roles: string[];
  maVaiTro: string[];
}

export interface ThongTinTaiKhoan {
  idTaiKhoan: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  anhDaiDien: string;
  gioiTinh: string;
  ngaySinh: string;
  canCuocCongDan: string;
  chucVuId: any;
  tenChucVu: any;
  donViId: any;
  donVi_RId: any;
  tenDonVi: any;
  ngayTao: string;
}
