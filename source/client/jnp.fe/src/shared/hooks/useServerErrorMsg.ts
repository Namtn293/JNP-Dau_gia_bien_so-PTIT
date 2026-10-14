import {
  COMMON_ACCESS_DENIED,
  COMMON_HTML_SCRIPT,
  COMMON_INTERNAL_SERVER_ERROR,
  COMMON_MISSING_PARAM,
  COMMON_NOT_FOUND,
  COMMON_UNAUTHORIZED,
} from "@shared/constants";

export const ERROR_CODE_MSG: Record<string, string> = {
  //common
  [COMMON_UNAUTHORIZED]: "Chưa xác thực",
  [COMMON_ACCESS_DENIED]: "Chưa có quyền",
  [COMMON_NOT_FOUND]: "Không tìm thấy",
  [COMMON_INTERNAL_SERVER_ERROR]: "Lỗi server",
  [COMMON_MISSING_PARAM]: "Thiếu tham số",
  [COMMON_HTML_SCRIPT]: "Không được phép nhập thẻ HTML",
  ["Common_404_ROOT_ID"]: "Không tìm thấy RootID",
  ["Common_404_TARGET_ID"]: "Không tìm thấy id nguồn",
  ["Admin_VungKinhTe_000"]: "Mã danh mục vùng kinh tế đã tồn tại!",
  ["Admin_VungKinhTe_001"]: "Tên vùng kinh tế đã tồn tại!",
  ["Admin_VungKinhTe_002"]: "Vùng kinh tế đã được sử dụng",
  ["Admin_VungKinhTe_003"]: "Tên tiếng Anh đã tồn tại!",
  ["Admin_VungKinhTe_004"]: "Tên tiếng Trung đã tồn tại!",
  ["Admin_VungKinhTe_005"]: "Tên tiếng Nhật đã tồn tại!",
  ["Admin_VungKinhTe_006"]: "Tên tiếng Hàn đã tồn tại!",
  ["Admin_VungKinhTe_200"]: "Sai dữ liệu", // Giải thích (VI): Mã lỗi 200 - Sai dữ liệu cho danh mục vùng kinh tế
  //Danh mục tổ chức quốc tế
  ["Admin_ToChucQuocTe_000"]: "Mã danh mục tổ chức quốc tế đã tồn tại",
  ["Admin_ToChucQuocTe_001"]: "Số điện thoại không hợp lệ",
  ["Admin_ToChucQuocTe_002"]: "Email không hợp lệ",
  ["Admin_ToChucQuocTe_003"]: "Fax không hợp lệ",
  ["Admin_ToChucQuocTe_200"]: "Sai dữ liệu", // Giải thích (VI): Mã lỗi 200 - Sai dữ liệu cho danh mục tổ chức quốc tế
  //Danh Mục Xã phường thị trấn
  ["Admin_XaPhuong_000"]: "Mã danh mục Xã/Phường đã tồn tại!",
  ["Admin_XaPhuong_001"]: "Tên đã tồn tại!",
  ["Admin_XaPhuong_002"]: "Kiểu Xã/Phường không hợp lệ",
  ["Admin_XaPhuong_003"]: "Không thể xóa vì Danh mục đang được sử dụng!",
  ["Admin_XaPhuong_004"]: "Tên tiếng Anh đã tồn tại!",
  ["Admin_XaPhuong_005"]: "Tên tiếng Trung đã tồn tại!",
  ["Admin_XaPhuong_006"]: "Tên tiếng Nhật đã tồn tại!",
  ["Admin_XaPhuong_007"]: "Tên tiếng Hàn đã tồn tại!",
  //Danh Mục Tỉnh thành phố
  ["Admin_TinhThanhPho_010"]: "Tỉnh thành phố hết hiệu lực, không thể gán!",
  ["Admin_TinhThanhPho_011"]: "Tỉnh thành phố không hoạt động, không thể gán!",
  ["Admin_QuocGia_014"]: "Quốc gia không hoạt động, không thể gán!",
  ["Admin_TinhThanhPho_000"]: "Mã danh mục Tỉnh/Thành Phố đã tồn tại",
  ["Admin_TinhThanhPho_200"]: "Sai dữ liệu", // Giải thích (VI): Mã lỗi 200 - Sai dữ liệu cho danh mục tỉnh thành phố
  //Danh mục Tỉnh thành phố - Quốc gia
  ["Admin_TinhThanh_Quocgia_000"]: "Mã đã tồn tại",
  ["Admin_TinhThanh_Quocgia_001"]: "Quốc gia không đúng",
  ["Admin_TinhThanh_Quocgia_200"]: "Sai dữ liệu", // Giải thích (VI): Mã lỗi 200 - Sai dữ liệu cho danh mục tỉnh thành phố quốc gia
  //Danh mục Quốc gia - Tổ chức quốc tế
  ["Admin_Quocgia_Tochuc_000"]: "Quốc gia không tồn tại",
  ["Admin_Quocgia_Tochuc_001"]: "Tổ chức quốc tế không tồn tại",
  //quốc gia

  ["Admin_QuocGia_000"]: "Danh mục đang được sử dụng",
  //Danh Mục Thủ Tục Hành Chính
  ["Admin_NhomThuTuc_000"]: "Mã loại TTHC đã tồn tại!",
  ["Admin_NhomThuTuc_001"]: "Không thể xóa vì loại TTHC đang được sử dụng!",
  ["Admin_NhomThuTuc_002"]: "Tên loại TTHC đã tồn tại!",
  ["Admin_NhomThuTuc_003"]: "Tên tiếng Anh đã tồn tại!",
  ["Admin_NhomThuTuc_004"]: "Tên tiếng Trung đã tồn tại!",
  ["Admin_NhomThuTuc_005"]: "Tên tiếng Nhật đã tồn tại!",
  ["Admin_NhomThuTuc_006"]: "Tên tiếng Hàn đã tồn tại!",
  //Ngày nghỉ
  ["Admin_NgayNghi_000"]: "Ngày nghỉ đã tồn tại",
  //Danh mục cơ quan
  ["Admin_CoQuan_000"]: "Mã danh mục cơ quan đã tồn tại",
  ["Admin_CoQuan_001"]: "Không tìm thấy danh mục cơ quan cha",
  ["Admin_CoQuan_002"]: "Không thể xóa vì Cơ quan đã được sử dụng",
  //Danh mục Ủy ban
  ["Admin_UyBan_000"]: "Mã đã tồn tại",
  ["Admin_UyBan_001"]: "Tỉnh thành không tồn tại",
  ["Admin_UyBan_002"]: "Đơn vị không tồn tại",
  ["Admin_UyBan_003"]: "Số điện thoại không hợp lệ",
  ["Admin_UyBan_004"]: "Email không hợp lệ",
  ["Admin_UyBan_005"]: "Fax không hợp lệ",
  //Danh mục cấp cơ quan quản lý
  ["Admin_CapCoQuanQuanLy_000"]: "Mã cấp cơ quan đã tồn tại",
  ["Admin_CapCoQuanQuanLy_001"]:
    "Không thể xóa vì Cấp cơ quan quản lý đang sử dụng",
  //DM dịch vụ công
  ["Admin_DichVu_000"]: "Mã dịch vụ công đã tồn tại!",
  ["Admin_DichVu_001"]: "Tên dịch vụ công đã tồn tại!",
  ["Admin_DichVu_002"]: "Cấp độ dịch vụ không hợp lệ",
  ["Admin_DichVu_003"]:
    "Thủ tục hành chính đã hết hiệu lực , vui lòng chọn lại thủ tục khác",
  ["Admin_DichVu_004"]: "Không tìm thấy trường hợp thủ tục",
  ["Admin_DichVu_005"]: "Dịch vụ công đã được sử dụng",
  ["Admin_DichVu_006"]: "Thủ tục hành chính không hoạt động, không thể gán!",
  ["Admin_DichVu_007"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_DichVu_008"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_DichVu_009"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_DichVu_010"]: "Phiên bản TTHC hiện tại đang hết hiệu lực",
  ["Admin_DichVu_011"]: "Không tìm thấy dịch vụ công",
  //Form tiếp nhận
  ["Admin_3000"]: "Thiếu tham số: Tên",
  //Lĩnh Vực
  ["Admin_LinhVuc_000"]: "Mã lĩnh vực đã tồn tại!",
  ["Admin_LinhVuc_001"]: "Không thể xóa vì lĩnh vực đang được sử dụng",
  ["Admin_LinhVuc_002"]: "Tên lĩnh vực đã tồn tại!",
  ["Admin_LinhVuc_003"]: "Tên tiếng Anh đã tồn tại!",
  ["Admin_LinhVuc_004"]: "Tên tiếng Trung đã tồn tại!",
  ["Admin_LinhVuc_005"]: "Tên tiếng Nhật đã tồn tại!",
  ["Admin_LinhVuc_006"]: "Tên tiếng Hàn đã tồn tại!",
  ["Admin_LinhVuc_008"]: "Tên lĩnh vực không được vượt quá 255 ký tự",
  ["Admin_LinhVuc_009"]:
    "Mã không được chứa khoảng trắng hoặc ký tự tiếng Việt có dấu",
  ["Admin_LinhVuc_010"]: "Tên tiếng Anh không được vượt quá 255 ký tự",
  ["Admin_LinhVuc_011"]: "Tên tiếng Trung không được vượt quá 255 ký tự",
  ["Admin_LinhVuc_012"]: "Tên tiếng Nhật không được vượt quá 255 ký tự",
  ["Admin_LinhVuc_013"]: "Tên tiếng Hàn không được vượt quá 255 ký tự",
  ["Admin_LinhVuc_014"]: "Mã không được vượt quá 50 ký tự",

  ["Admin_YeuCauBoSung_000"]: "Hồ sơ không tồn tại",
  ["Admin_YeuCauBoSung_001"]: "Vui lòng nhập lý do yêu cầu bổ sung",
  ["Admin_YeuCauBoSung_003"]: "Bạn không có quyền xử lý hồ sơ này",
  ["Admin_YeuCauBoSung_004"]: "Hồ sơ không ở trạng thái cho xử lý",
  ["Admin_YeuCauBoSung_005"]: "Hồ sơ đã được yêu cầu bổ sung",
  ["Admin_YeuCauBoSung_006"]:
    "Hồ sơ đang ở trạng thái lưu nháp, không thể yêu cầu bổ sung",
  ["Admin_YeuCauBoSung_007"]: "Đã vượt quá số lần gia hạn tối đa cho phép",
  ["Admin_YeuCauBoSung_008"]: "Hồ sơ chưa có giấy tờ",
  ["Admin_YeuCauBoSung_009"]: "Thiếu thông tin giấy tờ",
  //Cấp đơn vị
  ["Admin_CapDonVi_000"]: "Không thể xóa vì cấp đơn vị đang được sử dụng",
  ["Admin_CapDonVi_001"]: "Mã cấp đơn vị đã tồn tại",
  ["Admin_CapDonVi_002"]: "Tên cấp đơn vị đã tồn tại",
  ["Admin_CapDonVi_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_CapDonVi_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_CapDonVi_005"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_CapDonVi_006"]: "Tên tiếng Hàn đã tồn tại",
  //Thủ tục hành chính
  ["Admin_ThuTucHanhChinh_000"]: "Mã thủ tục hành chính đã tồn tại",
  ["Admin_ThuTucHanhChinh_001"]:
    "Không thể xóa vì Thủ tục hành chính đang được sử dụng",
  ["Admin_ThuTucHanhChinh_002"]:
    "Không thể xóa trường hợp TTHC hoặc trường hợp giấy tờ vì đang được sử dụng",
  ["Admin_ThuTucHanhChinh_003"]: "Tên thủ tục đã tồn tại",
  ["Admin_ThuTucHanhChinh_004"]:
    "Lĩnh vực không hoạt động, không thể gán cho thủ tục hành chính",
  ["Admin_ThuTucHanhChinh_005"]: "Loại thủ tục không hoạt động, không thể gán",
  ["Admin_ThuTucHanhChinh_006"]:
    "Căn cứ pháp lý không hoạt động, không thể gán cho thủ tục hành chính",
  ["Admin_ThuTucHanhChinh_007"]:
    "Giấy tờ không hoạt động, không thể gán cho thủ tục hành chính",
  ["Admin_ThuTucHanhChinh_008"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_ThuTucHanhChinh_009"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_ThuTucHanhChinh_010"]:
    "Đây không phải phiên bản hẹn lịch không thể xóa",
  //Giấy tờ thành phần hồ sơ
  ["Admin_GiayToThanhPhanHoSo_000"]: "Mã giấy tờ thành phần hồ sơ đã tồn tại",
  ["Admin_GiayToThanhPhanHoSo_001"]:
    "Không thể xóa vì Giấy tờ thành phần hồ sơ đang được sử dụng",
  ["Admin_GiayToThanhPhanHoSo_002"]: "Tên giấy tờ thành phần hồ sơ đã tồn tại",
  ["Admin_GiayToThanhPhanHoSo_003"]:
    "Tên tiếng Anh giấy tờ thành phần hồ sơ đã tồn tại",
  ["Admin_GiayToThanhPhanHoSo_004"]:
    "Tên tiếng Trung giấy tờ thành phần hồ sơ đã tồn tại",
  ["Admin_GiayToThanhPhanHoSo_005"]:
    "Tên tiếng Nhật giấy tờ thành phần hồ sơ đã tồn tại",
  ["Admin_GiayToThanhPhanHoSo_006"]:
    "Tên tiếng Hàn giấy tờ thành phần hồ sơ đã tồn tại",
  ["Admin_GiayToThanhPhanHoSo_007"]: "Giấy tờ đang được sử dụng. không thể xóa",

  //Đơn vị hành chính
  ["Admin_DonViHanhChinhNhom_000"]: "Mã đơn vị hành chính không hợp lệ",
  //Loại doanh nghiệp
  ["Admin_LoaiDoanhNghiep_000"]: "Mã loại doanh nghiệp đã tồn tại",
  ["Admin_LoaiDoanhNghiep_001"]: "Mã loại doanh nghiệp bắt buộc",
  ["Admin_LoaiDoanhNghiep_002"]: "Tên loại doanh nghiệp bắt buộc",
  ["Admin_LoaiDoanhNghiep_003"]: "Loại doanh nghiệp không tồn tại",
  ["Admin_LoaiDoanhNghiep_004"]: "Tên loại doanh nghiệp đã tồn tại",
  ["Admin_LoaiDoanhNghiep_005"]:
    "Tên tiếng Anh của loại doanh nghiệp đã tồn tại",
  ["Admin_LoaiDoanhNghiep_006"]:
    "Tên tiếng Trung của loại doanh nghiệp đã tồn tại",
  ["Admin_LoaiDoanhNghiep_007"]:
    "Tên tiếng Nhật của loại doanh nghiệp đã tồn tại",
  ["Admin_LoaiDoanhNghiep_008"]:
    "Tên tiếng Hàn của loại doanh nghiệp đã tồn tại",
  ["Admin_LoaiDoanhNghiep_009"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_LoaiDoanhNghiep_010"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_LoaiDoanhNghiep_011"]: "Phiên bản gốc khôn tồn tại",
  ["Admin_LoaiDoanhNghiep_012"]:
    "Đây không phải phiên bản hẹn lịch không thể xóa",
  //SITC
  ["Admin_SITC_000"]: "Mã SITC đã tồn tại",
  ["Admin_SITC_001"]: "Mã SITC bắt buộc",
  ["Admin_SITC_002"]: "Tên bắt buộc",
  ["Admin_SITC_003"]: "Cấp bắt buộc",
  ["Admin_SITC_004"]: "ID cha không hợp lệ",
  ["Admin_SITC_005"]: "Không thể xóa vì SITC đang được sử dụng",
  ["Admin_SITC_006"]: "Tên đã tồn tại",
  ["Admin_SITC_007"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_SITC_008"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_SITC_009"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_SITC_010"]: "Tên tiếng Hàn đã tồn tại",

  //Loại tỷ giá ngoại tệ
  ["Admin_LoaiTyGiaNgoaiTe_000"]: "Mã loại tỷ giá tiền tệ đã tồn tại",
  ["Admin_LoaiTyGiaNgoaiTe_001"]:
    "Không thể xóa vì Loại tỷ giá tiền tệ đang được sử dụng",
  ["Admin_LoaiTyGiaNgoaiTe_002"]: "Tên loại tỷ giá đã tồn tại",
  ["Admin_LoaiTyGiaNgoaiTe_003"]: "Tên tiếng Anh loại tỷ giá đã tồn tại",
  ["Admin_LoaiTyGiaNgoaiTe_004"]: "Tên tiếng Trung loại tỷ giá đã tồn tại",
  ["Admin_LoaiTyGiaNgoaiTe_005"]: "Tên tiếng Nhật loại tỷ giá đã tồn tại",
  ["Admin_LoaiTyGiaNgoaiTe_006"]: "Tên tiếng Hàn loại tỷ giá đã tồn tại",
  ["Admin_LoaiTyGiaNgoaiTe_007"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_LoaiTyGiaNgoaiTe_008"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_LoaiTyGiaNgoaiTe_009"]:
    "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_LoaiTyGiaNgoaiTe_010"]: "Loại tỷ giá hết hiệu lực, không thể gán!",
  ["Admin_LoaiTyGiaNgoaiTe_011"]: "Root không hoạt động",
  //Ngoại tệ
  ["Admin_NgoaiTe_000"]: "Mã ngoai tệ đã tồn tại",
  ["Admin_NgoaiTe_001"]: "Không thể xóa vì Danh mục ngoai tệ đang được sử dụng",
  ["Admin_NgoaiTe_002"]: "Loại tỷ giá không tồn tại",
  ["Admin_NgoaiTe_003"]: "Tên ngoại tệ đã tồn tại",
  ["Admin_NgoaiTe_004"]: "Tên tiếng Anh ngoại tệ đã tồn tại",
  ["Admin_NgoaiTe_005"]: "Tên tiếng Trung ngoại tệ đã tồn tại",
  ["Admin_NgoaiTe_006"]: "Tên tiếng Nhật ngoại tệ đã tồn tại",
  ["Admin_NgoaiTe_007"]: "Tên tiếng Hàn ngoại tệ đã tồn tại",
  ["Admin_NgoaiTe_008"]: "Loại tỷ giá không hoạt động, không thể gán",
  ["Admin_NgoaiTe_009"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_NgoaiTe_010"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_NgoaiTe_011"]: "Đây không phải phiên bản hẹn lịch nên không thể xóa",
  //Hình thức góp vốn
  ["Admin_HinhThucGopVon_000"]: "Không tìm thấy đơn vị tính",
  ["Admin_HinhThucGopVon_001"]: "Không tìm thấy ngoại tệ",
  ["Admin_HinhThucGopVon_002"]: "Tên Hình Thức Góp Vốn đã tồn tại",
  ["Admin_HinhThucGopVon_003"]: "Tên tiếng Anh Hình Thức Góp Vốn đã tồn tại",
  ["Admin_HinhThucGopVon_004"]: "Tên tiếng Trung Hình Thức Góp Vốn đã tồn tại",
  ["Admin_HinhThucGopVon_005"]: "Tên tiếng Nhật Hình Thức Góp Vốn đã tồn tại",
  ["Admin_HinhThucGopVon_006"]: "Tên tiếng Hàn Hình Thức Góp Vốn đã tồn tại",
  //Loại vốn đầu tư
  ["Admin_LoaiVonDauTu_000"]: "Mã loại vốn đầu tư đã tồn tại",
  ["Admin_LoaiVonDauTu_001"]:
    "Không thể xóa vì Loại vốn đầu tư đang được sử dụng",
  ["Admin_LoaiVonDauTu_002"]: "Tên loại vốn đầu tư đã tồn tại",
  ["Admin_LoaiVonDauTu_003"]: "Tên tiếng Anh loại vốn đầu tư đã tồn tại",
  ["Admin_LoaiVonDauTu_004"]: "Tên tiếng Trung loại vốn đầu tư đã tồn tại",
  ["Admin_LoaiVonDauTu_005"]: "Tên tiếng Nhật loại vốn đầu tư đã tồn tại",
  ["Admin_LoaiVonDauTu_006"]: "Tên tiếng Hàn loại vốn đầu tư đã tồn tại",
  //Hình thức đầu tư
  ["Admin_HinhThucDauTu_000"]: "Mã hình thức đầu tư đã tồn tại",
  ["Admin_HinhThucDauTu_001"]:
    "Không thể xóa do đang được sử dụng (trong bảng phân nhóm Phương thức - Hình thức)",
  ["Admin_HinhThucDauTu_002"]: "Tên Hình Thức Đầu Tư đã tồn tại",
  ["Admin_HinhThucDauTu_003"]: "Tên tiếng Anh đã tồn tại!",
  ["Admin_HinhThucDauTu_004"]: "Tên tiếng Trung đã tồn tại!",
  ["Admin_HinhThucDauTu_005"]: "Tên tiếng Nhật đã tồn tại!",
  ["Admin_HinhThucDauTu_006"]: "Tên tiếng Hàn đã tồn tại!",
  //sản phẩn công nghiệp
  ["Admin_SanPhamCongNghiep_000"]: "Mã sản phẩm công nghiệp đã tồn tại",
  ["Admin_SanPhamCongNghiep_001"]: "Đơn vị tính không tồn tại",
  ["Admin_SanPhamCongNghiep_002"]: "Tên sản phẩm công nghiệp đã tồn tại",
  ["Admin_SanPhamCongNghiep_003"]:
    "Tên tiếng Anh sản phẩm công nghiệp đã tồn tại",
  ["Admin_SanPhamCongNghiep_004"]:
    "Tên tiếng Trung sản phẩm công nghiệp đã tồn tại",
  ["Admin_SanPhamCongNghiep_005"]:
    "Tên tiếng Nhật sản phẩm công nghiệp đã tồn tại",
  ["Admin_SanPhamCongNghiep_006"]:
    "Tên tiếng Hàn sản phẩm công nghiệp đã tồn tại",
  //Phương thức đầu tư
  ["Admin_PhuongThucDauTu_000"]: "Mã phương thức đã tồn tại",
  ["Admin_PhuongThucDauTu_001"]:
    "Không thể xóa do đang được liên kết với Hình thức đầu tư",
  ["Admin_PhuongThucDauTu_002"]: "Tên phương thức đã tồn tại",
  ["Admin_PhuongThucDauTu_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_PhuongThucDauTu_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_PhuongThucDauTu_005"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_PhuongThucDauTu_006"]: "Tên tiếng Hàn đã tồn tại",

  //Phương thức - Hình thức đầu tư
  ["Admin_PhuongThucHinhThuc_000"]:
    "Cặp Phương thức - Hình thức này đã tồn tại",
  ["Admin_PhuongThucHinhThuc_001"]: "Phương thức đầu tư không tồn tại",
  ["Admin_PhuongThucHinhThuc_002"]: "Hình thức đầu tư không tồn tại",
  ["Admin_PhuongThucHinhThuc_003"]:
    "Phương thức đầu tư không hoạt động, không thể gán",
  ["Admin_PhuongThucHinhThuc_004"]:
    "Hình thức đầu tư không hoạt động, không thể gán",
  //Sở KHĐT
  ["Admin_SoKHDT_000"]: "Mã sở KHĐT đã tồn tại",
  ["Admin_SoKHDT_001"]: "Tỉnh/Thành Phố không tồn tại",
  //Đại diện xúc tiến đầu tư
  ["Admin_DaiDienXTDT_000"]: "Mã đại điện xúc tiến đầu tư đã tồn tại",
  //Doanh nghiệp
  ["Admin_DoanhNghiep_001"]: "Mã số thuế đã tồn tại",
  ["Admin_DoanhNghiep_002"]: "Loại doanh nghiệp không tồn tại",
  ["Admin_DoanhNghiep_003"]: "Quốc gia không tồn tại",
  ["Admin_DoanhNghiep_004"]: "Ngành kinh tế không tồn tại",
  ["Admin_DoanhNghiep_005"]: "Đơn vị quản lý không tồn tại",
  ["Admin_DoanhNghiep_006"]: "Vui lòng nhập thông tin Người đại diện",
  ["Admin_DoanhNghiep_007"]: "Tên người đại diện không được để trống",
  ["Admin_DoanhNghiep_008"]: "CCCD/Hộ chiếu không được để trống",
  //Lĩnh vực cấm đầu tư
  ["Admin_LinhVucCamDauTu_000"]: "Mã đã tồn tại",
  ["Admin_LinhVucCamDauTu_001"]: "Không thể xóa vì đang được sử dụng",
  ["Admin_LinhVucCamDauTu_002"]: "Tên đã tồn tại",
  ["Admin_LinhVucCamDauTu_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_LinhVucCamDauTu_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_LinhVucCamDauTu_005"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_LinhVucCamDauTu_006"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_LinhVucCamDauTu_007"]:
    "Lĩnh vực đang được sử dụng, không thể thay đổi",
  //Công trình xây dựng
  ["Admin_CongTrinhXayDung_000"]: "Mã công trình xây dựng đã tồn tại",
  ["Admin_CongTrinhXayDung_001"]: "Mã công trình xây dựng bắt buộc",
  ["Admin_CongTrinhXayDung_002"]: "Tên công trình xây dựng bắt buộc",
  ["Admin_CongTrinhXayDung_003"]: "Công trình xây dựng không tồn tại",
  ["Admin_CongTrinhXayDung_004"]: "Tên công trình xây dựng đã tồn tại",
  ["Admin_CongTrinhXayDung_005"]:
    "Tên tiếng Anh công trình xây dựng đã tồn tại",
  ["Admin_CongTrinhXayDung_006"]:
    "Tên tiếng Trung công trình xây dựng đã tồn tại",
  ["Admin_CongTrinhXayDung_007"]:
    "Tên tiếng Nhật công trình xây dựng đã tồn tại",
  ["Admin_CongTrinhXayDung_008"]:
    "Tên tiếng Hàn công trình xây dựng đã tồn tại",
  //Log hệ thống
  ["Admin_Menu_200"]: "Sai dữ liệu",
  ["Admin_LogHeThong_202"]: "Thiếu dữ liệu",
  ["Admin_menu_206"]: "Vượt mức giá trị cho phép",
  //Auth
  ["Admin_Auth_1721"]: "Sai tài khoản hoặc mật khẩu",
  ["Admin_Auth_1722"]: "Sai tên đăng nhập",
  ["Admin_Auth_1723"]: "Sai mật khẩu",
  ["Admin_Auth_1724"]: "Sai email",
  ["Admin_Auth_1725"]: "Sai dữ liệu",
  ["Admin_Auth_1727"]: "Sai định dạng email",
  ["Admin_Auth_Captcha_1727"]: "Đã nhập sai 5 lần",
  ["Admin_Auth_1732"]: "Sai mã thông báo",
  ["Admin_Auth_1733"]: "Thiếu mã cho phép",
  // Tài khoản
  ["Admin_TaiKhoan_101"]: "Vui lòng nhập tên đăng nhập",
  ["Admin_TaiKhoan_100"]: "Mật khẩu không được chứa ký tự đặc biệt",
  ["Admin_TaiKhoan_102"]: "Mật khẩu vượt quá độ dài cho phép",
  ["Admin_TaiKhoan_103"]: "Tên đăng nhập không được chứa ký tự đặc biệt",
  ["Admin_TaiKhoan_104"]: "Tên đăng nhập đã tồn tại",
  ["Admin_TaiKhoan_105"]: "Mật khẩu chứa ký tự không hợp lệ",
  ["Admin_ThongTinTaiKhoan_200"]: "Thiếu họ tên",
  ["Admin_ThongTinTaiKhoan_201"]: "Thiếu email",
  ["Admin_ThongTinTaiKhoan_202"]: "Thiếu CCCD/CMND",
  ["Admin_ThongTinTaiKhoan_203"]: "Họ tên quá dài",
  ["Admin_ThongTinTaiKhoan_204"]: "Email quá dài",
  ["Admin_ThongTinTaiKhoan_205"]: "Số điện thoại chỉ được phép 10 số",
  ["Admin_ThongTinTaiKhoan_206"]: "Địa chỉ quá dài",
  ["Admin_ThongTinTaiKhoan_207"]: "Ảnh đại diện không phù hợp",
  ["Admin_ThongTinTaiKhoan_208"]: "CCCD chỉ được phép 12 ký tự",
  ["Admin_ThongTinTaiKhoan_210"]: "Sai cú pháp họ tên",
  ["Admin_ThongTinTaiKhoan_211"]: "Sai cú pháp email",
  ["Admin_ThongTinTaiKhoan_212"]: "Sai cú pháp số điện thoại",
  ["Admin_ThongTinTaiKhoan_213"]: "Sai cú pháp địa chỉ",
  ["Admin_ThongTinTaiKhoan_214"]: "Sai cú pháp CCCD",
  ["Admin_ThongTinTaiKhoan_215"]: "Email đã tồn tại",
  ["Admin_ThongTinTaiKhoan_216"]: "Số điện thoại đã tồn tại",
  ["Admin_ThongTinTaiKhoan_217"]: "CCCD đã tồn tại",
  ["Admin_ThongTinTaiKhoan_218"]: "Tỉnh/Thành phố không hoạt động",
  ["Admin_ThongTinTaiKhoan_219"]: "Đơn vị không hoạt động",
  ["Admin_ThongTinTaiKhoan_220"]: "Tỉnh/Thành phố hết hiệu lực, không thể gán!",
  ["Admin_ThongTinTaiKhoan_221"]: "Đơn vị hết hiệu lực, không thể gán!",
  //Trình Độ học vấn
  ["Admin_TrinhDoHocVan_000"]: "Mã trình độ học vấn đã tồn tại",
  ["Admin_TrinhDoHocVan_001"]: "Mã trình độ học vấn bắt buộc",
  ["Admin_TrinhDoHocVan_002"]: "Tên trình độ học vấn bắt buộc",
  ["Admin_TrinhDoHocVan_003"]: "Tên trình độ học vấn đã tồn tại",
  ["Admin_TrinhDoHocVan_004"]: "Tên tiếng Anh đã tồn tại", // Can be Ten or TenEN depending on pattern, usually 002 is name if 001 is missing, but here 000 is ma. Let's trust errorMsg.ts text more.
  ["Admin_TrinhDoHocVan_005"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_TrinhDoHocVan_006"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_TrinhDoHocVan_007"]: "Tên tiếng Hàn đã tồn tại", // errorMsg.ts says 005 is CN
  //Tôn giáo
  ["Admin_TonGiao_000"]: "Mã tôn giáo đã tồn tại",
  ["Admin_TonGiao_001"]: "Mã bắt buộc",
  ["Admin_TonGiao_002"]: "Tên bắt buộc",
  ["Admin_TonGiao_003"]: "Tên đã tồn tại",
  ["Admin_TonGiao_004"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_TonGiao_005"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_TonGiao_006"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_TonGiao_007"]: "Tên tiếng Hàn đã tồn tại",

  ["Admin_Auth_1726"]: "Tài khoản bạn đăng nhập đã bị khóa",
  // Phân vùng dữ liệu theo đơn vị/tỉnh thành
  ["QTBV_UserScope_4001"]:
    "Tài khoản của bạn phải thuộc một đơn vị để thực hiện hành động này",
  ["QTBV_UserScope_4002"]: "Đơn vị của tài khoản không tồn tại",
  ["QTBV_UserScope_4003"]:
    "Đơn vị của tài khoản chưa được cấu hình cấp đơn vị",
  ["QTBV_UserScope_4004"]:
    "Cấp đơn vị của tài khoản không tồn tại hoặc đã ngừng hoạt động",
  ["QTBV_UserScope_4005"]:
    "Tài khoản của bạn cần thuộc một tỉnh/thành phố để thực hiện hành động này",
  ["QTBV_UserScope_4006"]:
    "Đơn vị cấp địa phương chưa được cấu hình tỉnh/thành phố",
  ["QTBV_UserScope_4008"]:
    "Không thể xác định phạm vi đơn vị của tài khoản",

  // Các mã lỗi CMS được trả về thay cho response text trực tiếp
  ["QTBV_Article_LanguageCode_Invalid"]:
    "Mã ngôn ngữ không hợp lệ. Chỉ chấp nhận: vi, en, cn, jp, kr",
  ["QTBV_Article_Excel_Empty"]: "File Excel không có dữ liệu",
  ["QTBV_Article_Excel_Limit_Exceeded"]:
    "File Excel chỉ được chứa tối đa 500 bài viết",
  ["QTBV_Article_PublishSchedule_Length_Mismatch"]:
    "Số bài viết và ngày xuất bản không khớp",
  ["QTBV_SEO_400"]: "Dữ liệu SEO không hợp lệ",
  ["QTBV_SEO_Url_Required"]: "URL không được để trống",
  ["QTBV_SEO_Url_Too_Long"]: "URL không được vượt quá 256 ký tự",
  ["QTBV_InitData_WorkflowStates_Missing"]:
    "Thiếu trạng thái để khởi tạo quy trình",
  ["QTBV_Configuration_MinioEndpoint_Required"]:
    "Cấu hình lưu trữ tệp chưa hợp lệ",
  ["QTBV_InternalAuth_Token_Required"]: "Thiếu token xác thực nội bộ",
  ["QTBV_InternalAuth_Token_Invalid"]:
    "Token xác thực nội bộ không hợp lệ",
  //Chuyên trang địa phương
  ["QTBV_InvestmentMap_501"]: "Mã chuyên trang đã tồn tại",
  ["QTBV_InvestmentMap_502"]: "Tên chuyên trang đã tồn tại",
  ["QTBV_InvestmentMap_503"]: "Đường dẫn đã tồn tại",
  ["QTBV_InvestmentMap_404"]:
    "Không tìm thấy thông tin tỉnh/thành phố tương ứng",
  ["QTBV_InvestmentMap_403"]:
    "Bạn không có quyền thao tác trên chuyên trang địa phương của tỉnh khác",
  //Nhân viên
  ["Admin_NhanVien_001"]: "Họ tên là bắt buộc",
  ["Admin_NhanVien_002"]: "Email là bắt buộc",
  ["Admin_NhanVien_003"]: "Email không đúng định dạng",
  ["Admin_NhanVien_004"]: "Độ dài họ tên không hợp lệ",
  ["Admin_NhanVien_005"]: "Giới tính không hợp lệ",
  ["Admin_NhanVien_006"]: "Email đã được sử dụng",
  ["Admin_NhanVien_007"]: "Mã nhân viên đã được sử dụng",
  ["Admin_NhanVien_008"]: "tài khoản đã được sử dụng hoặc không tồn tại",
  ["Admin_NhanVien_009"]: "Nhân viên đã có tài khoản ",
  //Đơn vị
  ["DONVI_MA_REQUIRED"]: "Mã đơn vị bắt buộc nhập",
  ["DONVI_TEN_REQUIRED"]: "Tên đơn vị bắt buộc nhập",
  ["DONVI_MA_EXIST"]: "Mã đơn vị đã tồn tại",
  ["DONVI_TEN_EXIST"]: "Tên đơn vị đã tồn tại",
  ["DONVI_EMAIL_EXIST"]: "Email đã tồn tại",
  ["DONVI_SDT_EXIST"]: "Số điện thoại đã tồn tại",
  ["DONVI_EMAIL_INVALID"]: "Email không hợp lệ",
  ["DONVI_SDT_INVALID"]: "Số điện thoại không hợp lệ",
  ["DONVI_PHONGBAN_INVALID"]: "Phòng ban đơn vị không hợp lệ",
  ["DONVI_FAX_INVALID"]: "Fax không hợp lệ",
  ["DONVI_PARENT_NOT_FOUND"]: "Đơn vị cha không tồn tại",
  ["DONVI_PARENT_CANNOT_BE_SELF"]: "Không được chọn chính mình làm đơn vị cha",
  ["DONVI_PARENT_CANNOT_BE_CHILD"]: "Không được chọn đơn vị con làm cha",
  ["Admin_DonVI_08"]: "Đơn vị không hợp lệ",
  ["Admin_DonVi_001"]: "Mã đơn vị đã tồn tại",
  ["Admin_DonVi_002"]: "Tên đơn vị đã tồn tại",
  ["Admin_DonVi_003"]: "Email đơn vị đã tồn tại",
  ["Admin_DonVi_004"]: "Giá trị vượt quá giới hạn",
  ["Admin_DonVi_005"]: "Số điện thoại đơn vị đã tồn tại",
  ["Admin_DonVi_006"]: "Số điện thoại không hợp lệ",
  ["Admin_DonVi_007"]: "Email không hợp lệ",
  ["Admin_DonVi_008"]: "Đơn vị cha không tồn tại",
  ["Admin_DonVi_009"]: "Không được chọn đơn vị cấp trên là chính nó!",
  ["Admin_DonVi_010"]:
    "Không được chọn đơn vị con làm đơn vị cha (tránh vòng lặp)",
  ["Admin_DonVi_011"]: "Nhân viên chưa thuộc đơn vị nào",
  ["Admin_DonVi_012"]: "Nhân viên đã thuộc đơn vị khác",
  ["Admin_DonVi_013"]: "Đơn vị không tồn tại",
  ["Admin_DonVi_014"]: "Danh sách nhân viên rỗng",
  ["Admin_DonVi_015"]: "Danh sách nhân viên không tồn tại",
  ["Admin_DonVi_016"]: "Đơn vị còn các đơn vị con",
  ["Admin_DonVi_017"]:
    "Không thể xoá đơn vị vì đang có tài khoản được gán với đơn vị",
  ["Admin_DonVi_018"]: "Ký hiệu đơn vị đã tồn tại",
  ["Admin_DonVi_019"]: "Giá trị vượt quá giới hạn",
  ["Admin_DonVi_020"]: "Giá trị vượt quá giới hạn",
  ["Admin_DonVi_021"]: "Đơn vị con không tồn tại",
  ["Admin_DonVi_022"]: "Đơn vị xử lý không tồn tại",
  ["Admin_DonVi_023"]: "Cấp đơn vị không tồn tại",
  ["Admin_DonVi_024"]: "Đơn vị không hoạt động, không thể gán",
  ["Admin_DonVi_025"]: "Tỉnh thành phố không hoạt động, không thể gán",
  ["Admin_DonVi_026"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_DonVi_027"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_DonVi_028"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_DonVi_029"]: "Đơn vị hết hiệu lực, không thể gán!",

  // Chức vụ
  ["Admin_ChucVu_000"]: "Mã chức vụ đã tồn tại",
  ["Admin_ChucVu_001"]: "Chức vụ đang được sử dụng, không thể xóa",
  ["Admin_ChucVu_002"]: "Tên chức vụ đã tồn tại",
  ["Admin_ChucVu_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_ChucVu_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_ChucVu_005"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_ChucVu_006"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_ChucVu_007"]: "Chức vụ đang được sử dụng, không thể xóa",
  //Menu

  ["Admin_Menu_600"]: "Thiếu ID menu",
  ["Admin_Menu_601"]: "Không được để trống mã menu",
  ["Admin_Menu_602"]: "Không được để trống tên menu",
  ["Admin_Menu_603"]: "Thiếu thứ tự hiển thị menu",
  ["Admin_Menu_604"]: "ID chỉ được nhập số",
  ["Admin_Menu_605"]: "Thứ tự hiển thị chỉ được nhập số",
  ["Admin_Menu_606"]: "Thiếu ID menu cha",
  ["Admin_Menu_607"]: "Mã menu đã tồn tại",
  ["Admin_Menu_608"]: "Có menu con không thể xóa",
  ["Admin_Menu_609"]: "Không tìm thấy menu cha",
  ["Admin_Menu_610"]: "Có menu con đang hoạt động, không thể thay đổi",
  ["Admin_Menu_611"]: "Còn menu con",
  ["Admin_Menu_612"]: "Menu cha không tồn tại",
  // NhomQuyen
  ["Admin_NhomQuyen_700"]: "Sai dữ liệu nhóm quyền",
  ["Admin_NhomQuyen_702"]: "Thiếu dữ liệu nhóm quyền",
  ["Admin_NhomQuyen_703"]: "Mã nhóm quyền đã tồn tại",
  ["Admin_NhomQuyen_704"]: "Mã nhóm quyền đã tồn tại",
  ["Admin_NhomQuyen_706"]: "Mã hoặc tên nhóm quyền quá dài",
  ["Admin_NhomQuyen_707"]: "Tạo thất bại nhóm quyền",
  ["Admin_NhomQuyen_708"]: "Cập nhật thất bại nhóm quyền",
  ["Admin_NhomQuyen_000"]: "Tên nhóm quyền đã tồn tại",
  //Quyen
  ["Admin_Quyen_800"]: "Sai dữ liệu quyền",
  ["Admin_Quyen_802"]: "Thiếu dữ liệu quyền",
  ["Admin_Quyen_803"]: "Mã quyền đã tồn tại",
  ["Admin_Quyen_804"]: "Đã tồn tại mã quyền",
  ["Admin_Quyen_806"]: "Tên hoặc mã quyền quá dài",
  //Vai trò
  ["Admin_VaiTro_400"]: "Sai dữ liệu",
  ["Admin_VaiTro_401"]: "Thiếu tham số",
  ["Admin_VaiTro_404"]: "Không tìm thấy",

  ["Admin_VaiTro_409"]: "Mã vai trò đã tồn tại",
  ["Admin_VaiTro_410"]: "Tên vai trò đã tồn tại",

  ["Admin_VaiTro_411"]: "Không thẻ xóa vì Vai trò đang được sử dụng",
  ["Admin_VaiTro_500"]: "Đã có lỗi xảy ra",
  ["Admin_VaiTro_501"]:
    "Mã không hợp lệ (mã không được chứa tiếng việt có dấu hoặc không được chứa khoảng trắng)",
  ["Common_400_MA"]: "Mã không hợp lệ (mã không được chứa tiếng việt có dấu)",
  ["Common_400_SPACE"]: "Mã không hợp lệ (mã không được chứa khoảng trắng)",
  //Thao tác
  ["Admin_Menu_702"]: "Thiếu dữ liệu",
  ["Admin_ThaoTac_700"]: "Sai dữ liệu",
  ["Admin_menu_706"]: "Vượt mức giá trị cho phép",
  ["Admin_ThaoTac_709"]: "Đã tồn tại",
  //Cấu hình hệ thống
  ["Admin_CauHinhHeThong_001"]: "Thiếu mã cấu hình",
  ["Admin_CauHinhHeThong_002"]: "Thiếu tên cấu hình",
  ["Admin_CauHinhHeThong_003"]: "Mã cấu hình đã tồn tại",
  ["Admin_CauHinhHeThong_004"]: "Không tìm thấy",
  ["Admin_CauHinhHeThong_005"]: "ID không hợp lệ",
  ["Admin_CauHinhHeThong_006"]: "Sai dữ liệu",
  ["Admin_CauHinhHeThong_007"]: "Tên không đúng định dạng",
  ["Admin_CauHinhHeThong_008"]: "Mã quá dài",
  ["Admin_CauHinhHeThong_009"]: "Phạm Vi Áp Dụng Không Tồn Tại",
  //Tham số hệ thống
  ["Admin_ThamSoHeThong_000"]: "Sai dữ liệu",
  ["Admin_ThamSoHeThong_001"]: "Mã đã được sử dụng",
  ["Admin_ThamSoHeThong_003"]: "Mã không đúng định dạng",
  ["Admin_ThamSoHeThong_004"]: "Mã quá dài",
  ["Admin_ThamSoHeThong_005"]: "Tên không đúng định dạng",
  ["Admin_ThamSoHeThong_006"]: "Tên quá dài",
  ["Admin_ThamSoHeThong_007"]: "Giá trị quá dài",
  ["Admin_ThamSoHeThong_008"]: "Mô tả không đúng định dạng",

  ["QTBV_FAQ_501"]: "Mã chủ đề đã tồn tại",
  ["QTBV_FAQ_502"]: "Tên chủ đề đã tồn tại",
  ["QTBV_FAQ_503"]: "Mã câu hỏi đã tồn tại",
  ["QTBV_FAQ_504"]: "Mã câu hỏi đã tồn tại",
  ["QTBV_FAQ_505"]: "Có tên câu hỏi bị trùng trong danh sách",
  ["QTBV_FAQ_506"]: "Thiếu thông tin bắt buộc cho câu hỏi",

  ["QTBV_FAQ_501_ENG"]: "Trùng tên chủ đề tiếng Anh",
  ["QTBV_FAQ_501_CHN"]: "Trùng tên chủ đề tiếng Trung",
  ["QTBV_FAQ_501_JPN"]: "Trùng tên chủ đề tiếng Nhật",
  ["QTBV_FAQ_501_KOR"]: "Trùng tên chủ đề tiếng Hàn",
  ["QTBV_FAQ_507"]: "Tên câu hỏi (Tiếng Việt) đã tồn tại",
  ["QTBV_FAQ_508"]: "Tên câu hỏi (Tiếng Anh) đã tồn tại",
  ["QTBV_FAQ_509"]: "Tên câu hỏi (Tiếng Trung) đã tồn tại",
  ["QTBV_FAQ_510"]: "Tên câu hỏi (Tiếng Nhật) đã tồn tại",
  ["QTBV_FAQ_511"]: "Tên câu hỏi (Tiếng Hàn) đã tồn tại",
  ["QTBV_FAQ_512"]: "Câu hỏi (Tiếng Việt): mã đã tồn tại",
  ["QTBV_FAQ_513"]: "Câu hỏi (tiếng Anh): mã đã tồn tại",
  ["QTBV_FAQ_514"]: "Câu hỏi (tiếng Trung): mã đã tồn tại",
  ["QTBV_FAQ_515"]: "Câu hỏi (tiếng Nhật): mã đã tồn tại",
  ["QTBV_FAQ_516"]: "Câu hỏi (tiếng Hàn): mã đã tồn tại",

  ["QTBV_Guide_501"]: "Mã chuyên mục đã tồn tại",
  ["QTBV_Guide_502"]: "Chuyên mục đang có bài viết, không thể xóa",
  ["QTBV_Guide_503"]: "Mã bài viết đã tồn tại",
  ["QTBV_Guide_504"]: "Tên chuyên mục đã tồn tại",
  ["QTBV_Guide_Code_Too_Long"]: "Mã không được vượt quá 256 ký tự",
  ["QTBV_Guide_Name_Too_Long"]: "Tên không được vượt quá 256 ký tự",
  ["QTBV_Guide_Description_Too_Long"]: "Mô tả không được vượt quá 3000 ký tự",
  ["QTBV_Guide_Icon_Too_Long"]: "Icon không được vượt quá 3000 ký tự",
  ["QTBV_Guide_Title_Too_Long"]: "Tiêu đề không được vượt quá 3000 ký tự",
  ["QTBV_Guide_AttachmentLink_Too_Long"]:
    "Link đính kèm không được vượt quá 500 ký tự",

  ["QTBV_Article_400"]: "Đầu vào không hợp lệ",
  ["QTBV_Article_4001"]: "Nội dung không tồn tại",
  ["QTBV_Article_4002"]: "Tóm tắt không tồn tại",
  ["QTBV_Article_4043"]: "File Excel không tồn tại",
  ["QTBV_Article_4003"]: "Sai định dạng",
  ["QTBV_Article_4004"]: "Sự kiện không tồn tại",
  ["QTBV_Article_4005"]: "Tag (thẻ) không tồn tại",
  ["QTBV_Article_TAG_NOT_FOUND"]: "Tag (thẻ) không tồn tại",
  ["QTBV_Article_4006"]: "Tác giả không tồn tại",
  ["QTBV_Article_4007"]: "Mã sự kiện không hợp lệ trong excel",
  ["QTBV_Article_4045"]: "Thiếu mã sự kiện trong excel",
  ["QTBV_Article_4046"]: "Thiếu tiêu đề trong excel",
  ["QTBV_Article_4047"]: "Thiếu tóm tắt trong excel",
  ["QTBV_Article_4008"]: "Tác giả không hợp lệ trong excel",
  ["QTBV_Article_4009"]: "URL trùng lặp",
  ["QTBV_Article_4010"]: "Ngôn ngữ bài viết không hợp lệ",
  ["QTBV_Article_4011"]: "Trùng lặp file excel",
  ["QTBV_Article_403"]: "Không có quyền truy cập",
  ["QTBV_Article_404"]: "Không tìm thấy",
  ["QTBV_Article_409"]: "Bài viết đang sử dụng",
  ["QTBV_Article_410"]: "Lỗi validation tiêu đề",
  ["QTBV_Article_411"]: "Lỗi validation đường dẫn",
  ["QTBV_Article_401"]: "Bài viết đã tồn tại",
  ["QTBV_Article_Summary_Too_Long"]:
    "Tóm tắt bài viết không được vượt quá 3000 ký tự",
  ["QTBV_Article_Code_Too_Long"]: "Mã bài viết không được vượt quá 256 ký tự",
  ["QTBV_Article_Name_Too_Long"]: "Tên bài viết không được vượt quá 256 ký tự",
  ["QTBV_Article_Description_Too_Long"]:
    "Mô tả bài viết không được vượt quá 3000 ký tự",

  ["QTBV_Tag_400"]: "Đầu vào không hợp lệ",
  ["QTBV_Tag_401"]: "Tag đã tồn tại",
  ["QTBV_Tag_403"]: "Không có quyền truy cập",
  ["QTBV_Tag_404"]: "Không tìm thấy",
  ["QTBV_Tag_409"]: "Trùng lặp",
  ["QTBV_Tag_410"]: "Tag đang được sử dụng",
  ["QTBV_Tag_Name_Too_Long"]: "Tên tag không được vượt quá 256 ký tự",
  ["QTBV_Tag_Title_Too_Long"]: "Tiêu đề tag không được vượt quá 256 ký tự",
  ["QTBV_Tag_502"]: "Tên tag đã tồn tại",
  ["QTBV_Tag_503"]: "Mã tag đã tồn tại",

  ["QTBV_EventFlow_400"]: "Đang được sử dụng",
  ["QTBV_EventFlow_401"]: "Thiếu tham số Tên",
  ["QTBV_EventFlow_402"]: "Mã Code đã tồn tại",
  ["QTBV_EventFlow_403"]: "Sai SiteId",
  ["QTBV_EventFlow_404"]: "Không tìm thấy",
  ["QTBV_EventFlow_405"]: "Tên sự kiện đã tồn tại",
  ["QTBV_EventFlow_Code_Too_Long"]: "Mã sự kiện không được vượt quá 256 ký tự",
  ["QTBV_EventFlow_Name_Too_Long"]: "Tên sự kiện không được vượt quá 256 ký tự",
  ["QTBV_EventFlow_Description_Too_Long"]:
    "Mô tả sự kiện không được vượt quá 3000 ký tự",

  ["QTBV_ALBUM_404"]: "Không tìm thấy Album",
  ["QTBV_ALBUM_IMAGE_404"]: "Không tìm thấy Album Image",
  ["QTBV_ALBUMIMAGE_405"]: "Chưa có file được chọn",

  ["QTBV_Category_502"]: "Code đã được sử dụng",
  ["QTBV_Category_Duplicate_Name"]: "Tên chuyên mục đã tồn tại",
  ["QTBV_Category_503"]: "Chuyên mục đang sử dụng",
  ["QTBV_Category_404"]: "Chuyên mục không tìm thấy",
  ["QTBV_Category_Parent_Being_Used"]: "Chuyên mục cha đang được sử dụng",
  ["QTBV_Category_Child_Being_Used"]: "Chuyên mục con đang được sử dụng",
  ["QTBV_Category_Code_Too_Long"]:
    "Mã chuyên mục không được vượt quá 256 ký tự",
  ["QTBV_Category_Name_Too_Long"]:
    "Tên chuyên mục không được vượt quá 256 ký tự",
  ["QTBV_Category_Description_Too_Long"]:
    "Mô tả chuyên mục không được vượt quá 3000 ký tự",

  ["QTBV_Topic_400"]: "Đầu vào không hợp lệ",
  ["QTBV_Topic_502"]: "Code đã được sử dụng",
  ["QTBV_Topic_Duplicate_Name"]: "Tên chủ đề đã tồn tại",
  ["QTBV_Topic_503"]: "Chủ đề đang sử dụng",
  ["QTBV_Topic_404"]: "Không tìm thấy",
  ["QTBV_Topic_Code_Too_Long"]: "Mã chủ đề không được vượt quá 256 ký tự",
  ["QTBV_Topic_Name_Too_Long"]: "Tên chủ đề không được vượt quá 256 ký tự",
  ["QTBV_Topic_Description_Too_Long"]:
    "Mô tả chủ đề không được vượt quá 3000 ký tự",

  ["QTBV_Menu_504"]: "Menu đang được sử dụng",
  ["QTBV_Menu_501"]: "Tên menu đã tồn tại",
  ["QTBV_Menu_502"]: "Mã menu đã tồn tại",
  ["QTBV_Menu_404"]: "Menu cha không tồn tại hoặc đã bị xóa",
  ["QTBV_Menu_4001"]: "Tên menu không được để trống",
  ["QTBV_Menu_4002"]: "Mã menu không được để trống",

  ["QTBV_Author_404"]: "Không tồn tại",
  ["QTBV_Author_503"]: "Tác giả đang được sử dụng",
  ["QTBV_Author_001"]: "Trùng tên đầy đủ",
  ["QTBV_Author_002"]: "Trùng URL tên",
  ["QTBV_Author_003"]: "URL tên không được để trống",
  ["QTBV_Author_004"]: "Bút danh đã tồn tại",
  ["QTBV_Author_FullName_Too_Long"]:
    "Tên đầy đủ của tác giả không được vượt quá 256 ký tự",
  ["QTBV_Author_UrlName_Too_Long"]:
    "URL tên của tác giả không được vượt quá 256 ký tự",
  ["QTBV_Author_Biography_Too_Long"]:
    "Mô tả tiểu sử của tác giả không được vượt quá 3000 ký tự",

  ["QTBV_SEO_001"]: "MetaTitle không được quá 256 ký tự",
  ["QTBV_SEO_002"]: "MetaKeyword không được quá 256 ký tự",
  ["QTBV_SEO_003"]: "MetaDescription không được quá 3000 ký tự",
  ["QTBV_SEO_004"]: "MetaRobots không được quá 256 ký tự",
  ["QTBV_SEO_005"]: "MetaContent không được quá 3000 ký tự",
  ["QTBV_SEO_006"]: "MetaRating không được quá 256 ký tự",

  ["QTBV_Workflow_400"]: "Thiếu tham số / dữ liệu",
  ["QTBV_Workflow_401"]: "Đầu vào không hợp lệ",
  ["QTBV_Workflow_402"]: "Danh sách bài viết không hợp lệ",
  ["QTBV_Workflow_403"]: "Không tìm thấy trạng thái Duyệt xuất bản",
  ["QTBV_Workflow_404"]:
    "Không tìm thấy bài viết hoặc bài viết không thuộc site hiện tại",
  ["QTBV_Workflow_405"]: "Bài viết không thuộc quy trình hiện tại",
  ["QTBV_Workflow_406"]:
    "Chỉ được hủy lịch các bài viết đang lên lịch xuất bản trong tương lai",

  ["QTBV_User_404"]: "User không tìm thấy",
  ["QTBV_User_504"]: "User đang bị khóa",
  ["QTBV_User_503"]: "Sai mật khẩu",
  ["QTBV_User_501"]: "Tên người dùng đã tồn tại",

  ["QTBV_Role_502"]: "Role đã tồn tại",

  ["QTBV_Account_400"]: "Cấu hình sai multisite",
  ["QTBV_Account_401"]: "Đăng nhập không thành công",
  ["QTBV_Account_402"]: "Đổi mật khẩu không thành công",
  ["QTBV_Account_500"]: "Đăng nhập lỗi",

  ["FILE_NOT_FOUND_404"]: "Không tìm thấy đường dẫn",
  ["MISSING_PARAM_Ids"]: "Thiếu danh sách Ids",

  ["External_Upload_1681"]: "Sai dữ liệu",
  ["External_Upload_1682"]: "Quá kích thước cho phép!",
  ["External_Upload_1683"]: "Thiếu extension",
  ["External_Upload_1684"]: "Sai extension",
  ["External_Upload_1685"]: "Quá tải dung lượng file",
  ["External_Upload_1687"]: "File không tồn tại",
  ["External_Upload_1688"]: "Đường dẫn file không hợp lệ",
  ["External_Upload_1689"]: "Chỉ được sử dụng 1 phương thức tại thời điểm",

  ["User_FileManager_000"]: "Cấu trúc file không hợp lệ",
  ["User_FileManager_001"]: "Tên đã tồn tại",
  ["User_FileManager_002"]: "File không tồn tại",
  ["User_FileManager_003"]: "File được sử dụng bởi bài viết",
  ["User_FileManager_004"]:
    "Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn 10MB.",
  ["User_FileManager_005"]: "File đang được sử dụng bởi banner",
  ["User_FileManager_006"]: "File đang được sử dụng bởi chuyên mục",
  ["User_FileManager_007"]: "File đang được sử dụng bởi tác giả",
  ["User_FileManager_008"]: "File đang được sử dụng bởi album ảnh",
  ["User_FileManager_009"]: "File đang được sử dụng bởi menu",

  ["QTBV_BannerGroup_501"]: "Tên nhóm banner đã tồn tại",
  ["QTBV_BannerGroup_502"]: "Mã nhóm banner đã tồn tại",
  ["QTBV_BannerGroup_503"]: "Mã section không được vượt quá 256 ký tự",
  ["QTBV_BannerGroup_504"]: "Tên không được vượt quá 256 ký tự",
  ["QTBV_BannerGroup_505"]: "Mã nhóm banner không được vượt quá 256 ký tự",

  ["QTBV_Banner_501"]: "Tiêu đề banner đã tồn tại",
  ["QTBV_Banner_502"]: "Mã section không được vượt quá 256 ký tự",
  ["QTBV_Banner_503"]: "Tiêu đề không được vượt quá 256 ký tự",
  ["QTBV_Banner_504"]: "Tên không được vượt quá 256 ký tự",
  ["QTBV_Banner_Summary_Too_Long"]:
    "Tóm tắt banner không được vượt quá 3000 ký tự.",
  //Nhóm người dùng
  ["Admin_NhomNguoiDung_001"]: "Quyền không tồn tại",
  ["Admin_NhomNguoiDung_002"]: "Tên nhóm đã tồn tại",
  ["Admin_NhomNguoiDung_003"]: "Danh sách quyền bị rỗng (Bad Request)",
  ["Admin_NhomNguoiDung_004"]: "Mã nhóm bắt buộc",
  ["Admin_NhomNguoiDung_005"]: "Mã nhóm quá dài",
  ["Admin_NhomNguoiDung_006"]: "Tên nhóm bắt buộc",
  ["Admin_NhomNguoiDung_007"]: "Tên nhóm quá dài",
  ["Admin_NhomNguoiDung_008"]: "Mô tả nhóm quá dài",
  //Giấy tờ hồ sơ
  ["GiayToHoSo_404"]: "Không tìm thấy hồ sơ",
  //Thông tin người nộp
  ["TiepNhanHoSo_ThongTinNguoiNop_400"]: "Sai dữ liệu",
  ["TiepNhanHoSo_CN_TEN_001"]: "Tên người nộp không được để trống",
  ["TiepNhanHoSo_CN_CCCD_002"]: "Số CCCD không được để trống",
  ["TiepNhanHoSo_CN_NGAYCAP_003"]: "Ngày cấp bắt buộc",
  ["TiepNhanHoSo_CN_NOICAP_004"]: "Nơi cấp bắt buộc",
  ["TiepNhanHoSo_CN_SDT_005"]: "Số điện thoại không được để trống",
  ["TiepNhanHoSo_CN_EMAIL_006"]: "Email không được để trống",
  ["TiepNhanHoSo_CN_DIACHI_007"]: "Địa chỉ không được để trống",
  ["TiepNhanHoSo_TC_TEN_011"]: "Tên tổ chức không được để trống",
  ["TiepNhanHoSo_TC_MA_012"]: "Mã tổ chức không được để trống",
  ["TiepNhanHoSo_TC_NGAYCAP_013"]: "Ngày cấp bắt buộc",
  ["TiepNhanHoSo_TC_NOICAP_014"]: "Nơi cấp bắt buộc",
  ["TiepNhanHoSo_TC_EMAIL_015"]: "Email tổ chức không được để trống",
  ["TiepNhanHoSo_TC_DIACHI_016"]: "Đia chỉ tổ chức không được để trống",
  ["TiepNhanHoSo_00999"]: " Trạng thái tiếp nhận không hợp lệ",

  //Xử lý hồ sơ
  //Upload

  ["External_Upload_1684 - Only doc,docx,xls,xlsx,pdf,jpg,jpeg,png,gif,txt,webp"]:
    "Sai dịnh dạng files. tải thất bại, Files hợp lệ: doc,docx,xls,xlsx,pdf,jpg,jpeg,png,gif,txt,webp",
  // Validate riêng theo từng loại upload BDS (mã dạng "{code}:{ContextType}" - khớp MinioSettings.Items trong appsettings)
  ["External_Upload_1685:BanDoNenHinhAnh"]: "Dung lượng ảnh bản đồ nền vượt quá giới hạn cho phép (500 KB)",
  ["External_Upload_1684:BanDoNenHinhAnh"]: "Định dạng ảnh bản đồ nền không hợp lệ, chỉ chấp nhận: jpg, jpeg, png",
  ["External_Upload_1685:BieuTuong"]: "Dung lượng biểu tượng vượt quá giới hạn cho phép (500 KB)",
  ["External_Upload_1684:BieuTuong"]: "Định dạng biểu tượng không hợp lệ, chỉ chấp nhận: png, jpg, jpeg",
  ["External_Upload_1685:MoHinh"]: "Dung lượng mô hình vượt quá giới hạn cho phép (5 MB)",
  ["External_Upload_1684:MoHinh"]: "Định dạng mô hình không hợp lệ, chỉ chấp nhận: glb",
  //Password
  ["External_PsH_2891"]: "Sai dữ liệu",
  ["External_PsH_2892"]: "Sai định dạng",
  ["External_Psh_2893"]: "Xác thực thất bại",
  //Time convertor
  ["External_TC_3991"]: "Sai dữ liệu",
  ["External_TC_3992"]: "Sai định dạng tổng thể",
  ["External_TC_3993"]: "Không hỗ trợ định dạng đơn vị",
  //Loại hình giáo dục
  ["Admin_LoaiHinhGiaoDuc_000"]: "Mã đã tồn tại",
  ["Admin_LoaiHinhGiaoDuc_001"]: "Không thể xóa vì đang được sử dụng",
  ["Admin_LoaiHinhGiaoDuc_002"]: "Tên đã tồn tại",
  ["Admin_LoaiHinhGiaoDuc_003"]: "Tên đã tồn tại",
  ["Admin_LoaiHinhGiaoDuc_004"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_LoaiHinhGiaoDuc_005"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_LoaiHinhGiaoDuc_006"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_LoaiHinhGiaoDuc_007"]: "Tên tiếng Hàn đã tồn tại",
  //EBOPS
  ["Admin_EBOPS_000"]: "Mã EBOPS đã tồn tại",
  ["Admin_EBOPS_001"]: "EBOPS cha không tồn tại",
  ["Admin_EBOPS_002"]: "EBOPS cha không hợp lệ (trỏ vào chính nó)",
  ["Admin_EBOPS_003"]: "Phát hiện vòng lặp trong cây EBOPS",
  ["Admin_EBOPS_004"]: "Không thể xóa vì tồn tại cấp con",
  ["Admin_EBOPS_005"]: "Tên đã tồn tại",
  ["Admin_EBOPS_006"]: "Tên đã tồn tại",
  ["Admin_EBOPS_007"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_EBOPS_008"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_EBOPS_009"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_EBOPS_010"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_EBOPS_011"]: "Mã không được chứa khoảng trắng đầu/cuối",
  ["Admin_EBOPS_012"]: "Tên không được chứa khoảng trắng đầu/cuối",
  ["Admin_EBOPS_013"]: "Tên tiếng Anh không được chứa khoảng trắng đầu/cuối",
  ["Admin_EBOPS_014"]: "Tên tiếng Trung không được chứa khoảng trắng đầu/cuối",
  ["Admin_EBOPS_015"]: "Tên tiếng Nhật không được chứa khoảng trắng đầu/cuối",
  ["Admin_EBOPS_016"]: "Tên tiếng Hàn không được chứa khoảng trắng đầu/cuối",
  //Quốc gia
  ["Admin_QuocGia_001"]: "Tên đã tồn tại",
  ["Admin_QuocGia_002"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_QuocGia_003"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_QuocGia_004"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_QuocGia_005"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_QuocGia_006"]: "Khu vực địa lý không hoạt động, không thể gán",
  ["Admin_QuocGia_007"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_QuocGia_008"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_QuocGia_009"]: "Khu vực địa lý không tồn tại",
  ["Admin_QuocGia_010"]: "Phiên bản gốc không tồn tại",
  ["Admin_QuocGia_011"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_QuocGia_012"]: "Mã Quốc gia đã tồn tại!",
  ["Admin_QuocGia_013"]: "Quốc gia hết hiệu lực, không thể gán!",
  //Tỉnh thành phố (Combine patterns to be safe)
  ["Admin_TinhThanhPho_001"]: "Danh mục đang được sử dụng",
  ["Admin_TinhThanhPho_002"]: "Tên đã tồn tại", // Can be Ten or TenEN depending on pattern, usually 002 is name if 001 is missing, but here 000 is ma. Let's trust errorMsg.ts text more.
  ["Admin_TinhThanhPho_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_TinhThanhPho_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_TinhThanhPho_005"]: "Tên tiếng Nhật đã tồn tại", // errorMsg.ts says 005 is CN
  ["Admin_TinhThanhPho_006"]: "Tên tiếng Hàn đã tồn tại", // Extra from constants file
  ["Admin_TinhThanhPho_007"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_TinhThanhPho_008"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_TinhThanhPho_009"]: "Đây không phải phiên bản hẹn lịch không thể xóa", //Tỉnh thành phố Quốc gia

  ["Admin_TinhThanh_Quocgia_003"]: "Tên đã tồn tại",
  ["Admin_TinhThanh_Quocgia_004"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_TinhThanh_Quocgia_005"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_TinhThanh_Quocgia_006"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_TinhThanh_Quocgia_007"]: "Tên tiếng Hàn đã tồn tại",
  //Tổ chức Quốc tế
  ["Admin_ToChucQuocTe_005"]: "Tên đã tồn tại",
  ["Admin_ToChucQuocTe_004"]: "Danh mục đang được sử dụng",
  ["Admin_ToChucQuocTe_006"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_ToChucQuocTe_007"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_ToChucQuocTe_008"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_ToChucQuocTe_009"]: "Tên tiếng Hàn đã tồn tại",
  //Vùng kinh tế
  // ["Admin_VungKinhTe_003"]: "Tên tiếng Anh đã tồn tại",
  // ["Admin_VungKinhTe_004"]: "Tên tiếng Trung đã tồn tại",
  // ["Admin_VungKinhTe_005"]: "Tên tiếng Nhật đã tồn tại",
  // ["Admin_VungKinhTe_006"]: "Tên tiếng Hàn đã tồn tại",
  //Dịch vụ XNK
  ["Admin_DichVuXNK_000"]: "Mã đã tồn tại",
  ["Admin_DichVuXNK_001"]: "Cấp cha không tồn tại",
  ["Admin_DichVuXNK_002"]: "Cấp cha không hợp lệ (trỏ vào chính nó)",
  ["Admin_DichVuXNK_003"]: "Phát hiện vòng lặp trong cây",
  ["Admin_DichVuXNK_004"]: "Không thể xóa vì tồn tại cấp con",
  ["Admin_DichVuXNK_005"]: "Tên đã tồn tại",
  ["Admin_DichVuXNK_006"]: "Tên đã tồn tại",
  ["Admin_DichVuXNK_007"]: "Tên đã tồn tại",
  ["Admin_DichVuXNK_008"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_DichVuXNK_009"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_DichVuXNK_010"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_DichVuXNK_011"]: "Tên tiếng Hàn đã tồn tại",
  //Hệ thống NSP
  ["dm_HeThongNSP_001"]: "Mã đã tồn tại",
  ["dm_HeThongNSP_002"]: "Cấp cha không tồn tại",
  ["dm_HeThongNSP_003"]: "Không thể set cấp cha cho chính nó",
  ["dm_HeThongNSP_004"]: "Không thể xóa bản ghi khi có dữ liệu con",
  ["dm_HeThongNSP_005"]: "Phát hiện tham chiếu vòng trong cấu trúc cây",
  ["dm_HeThongNSP_006"]: "Tên đã tồn tại",
  ["dm_HeThongNSP_007"]: "Tên tiếng Anh đã tồn tại",
  ["dm_HeThongNSP_008"]: "Tên tiếng Trung đã tồn tại",
  ["dm_HeThongNSP_009"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_HeThongNSP_010"]: "Tên tiếng Hàn đã tồn tại",
  //Nghề nghiệp
  ["Admin_NgheNghiep_000"]: "Mã danh mục nghề nghiệp đã tồn tại",
  ["Admin_NgheNghiep_001"]: "mã bắt buộc",
  ["Admin_NgheNghiep_002"]: "Tên bắt buộc",
  ["Admin_NgheNghiep_003"]: "Tên đã tồn tại",
  ["Admin_NgheNghiep_004"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_NgheNghiep_005"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_NgheNghiep_006"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_NgheNghiep_007"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_NgheNghiep_008"]: "mã không được có khoảng trắng đầu/cuối",
  ["Admin_NgheNghiep_009"]: "Tên không được có khoảng trắng đầu/cuối",
  ["Admin_NgheNghiep_010"]: "Tên tiếng Anh không được có khoảng trắng đầu/cuối",
  ["Admin_NgheNghiep_011"]:
    "Tên tiếng Trung không được có khoảng trắng đầu/cuối",
  ["Admin_NgheNghiep_012"]:
    "Tên tiếng Nhật không được có khoảng trắng đầu/cuối",
  ["Admin_NgheNghiep_013"]: "Tên tiếng Hàn không được có khoảng trắng đầu/cuối",
  //Hàng hóa XNK
  ["dm_HangHoaXNK_001"]: "Mã danh mục Hàng hóa XNK đã tồn tại",
  ["dm_HangHoaXNK_002"]: "Mã bắt buộc",
  ["dm_HangHoaXNK_003"]: "Tên bắt buộc",
  ["dm_HangHoaXNK_004"]: "Đơn vị tính bắt buộc",
  ["dm_HangHoaXNK_005"]: "Đơn vị tính không tồn tại",
  ["dm_HangHoaXNK_006"]: "Hàng hóa cha không tồn tại",
  ["dm_HangHoaXNK_007"]: "Không thể set Hàng hóa cha là chính nó",
  ["dm_HangHoaXNK_008"]: "Không thể xóa hàng hóa có dữ liệu con",
  ["dm_HangHoaXNK_009"]: "Phát hiện tham chiếu vòng trong cấu trúc cây",
  ["dm_HangHoaXNK_010"]: "Tên đã tồn tại",
  ["dm_HangHoaXNK_011"]: "Tên tiếng Anh đã tồn tại",
  ["dm_HangHoaXNK_012"]: "Tên tiếng Trung đã tồn tại",
  ["dm_HangHoaXNK_013"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_HangHoaXNK_014"]: "Tên tiếng Hàn đã tồn tại",
  ["dm_HangHoaXNK_015"]: "Mã không được chứa khoảng trắng ở đầu/cuối",
  ["dm_HangHoaXNK_016"]: "Tên không được chứa khoảng trắng ở đầu/cuối",
  ["dm_HangHoaXNK_017"]:
    "Tên tiếng Anh không được chứa khoảng trắng ở đầu/cuối",
  ["dm_HangHoaXNK_018"]:
    "Tên tiếng Trung không được chứa khoảng trắng ở đầu/cuối",
  ["dm_HangHoaXNK_019"]:
    "Tên tiếng Nhật không được chứa khoảng trắng ở đầu/cuối",
  ["dm_HangHoaXNK_020"]:
    "Tên tiếng Hàn không được chứa khoảng trắng ở đầu/cuối",
  ["Admin_HangHoaXNK_026"]: "Hàng hóa cha hết hiệu lực, không thể gán!",
  //Bộ ngành
  ["dm_BoNganh_001"]: "Mã đã tồn tại",
  ["dm_BoNganh_002"]: "Tên đã tồn tại",
  ["dm_BoNganh_003"]: "Tên tiếng Anh đã tồn tại",
  ["dm_BoNganh_004"]: "Tên tiếng Trung đã tồn tại",
  ["dm_BoNganh_005"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_BoNganh_006"]: "Tên tiếng Hàn đã tồn tại",
  ["dm_BoNganh_007"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_BoNganh_008"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_BoNganh_009"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_BoNganh_010"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_BoNganh_011"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_BoNganh_012"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_BoNganh_013"]: "Ngày hiệu lực không hợp lệ",
  ["dm_BoNganh_014"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["dm_BoNganh_015"]: "Phiên bản gốc không tồn tại",
  ["dm_BoNganh_016"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  //KCN Quy hoạch
  ["dm_KCNQuyHoach_000"]: "Mã khu đã tồn tại",
  ["dm_KCNQuyHoach_001"]: "Tên khu đã tồn tại",
  ["dm_KCNQuyHoach_002"]: "Tên tiếng Anh đã tồn tại",
  ["dm_KCNQuyHoach_003"]: "Tên tiếng Trung đã tồn tại",
  ["dm_KCNQuyHoach_004"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_KCNQuyHoach_005"]: "Tên tiếng Hàn đã tồn tại",
  ["dm_KCNQuyHoach_006"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KCNQuyHoach_007"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KCNQuyHoach_008"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KCNQuyHoach_009"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KCNQuyHoach_010"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KCNQuyHoach_011"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",

  //KKT Quy hoạch
  ["dm_KKTQuyHoach_000"]: "Mã khu đã tồn tại",
  ["dm_KKTQuyHoach_001"]: "Tên khu đã tồn tại",
  ["dm_KKTQuyHoach_002"]: "Tên tiếng Anh đã tồn tại",
  ["dm_KKTQuyHoach_003"]: "Tên tiếng Trung đã tồn tại",
  ["dm_KKTQuyHoach_004"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_KKTQuyHoach_005"]: "Tên tiếng Hàn đã tồn tại",
  ["dm_KKTQuyHoach_006"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KKTQuyHoach_007"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KKTQuyHoach_008"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KKTQuyHoach_009"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KKTQuyHoach_010"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_KKTQuyHoach_011"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",

  //Dân tộc
  ["dm_DanToc_000"]: "Mã đã tồn tại",
  ["dm_DanToc_001"]: "Tên đã tồn tại",
  ["dm_DanToc_002"]: "Tên tiếng Anh đã tồn tại",
  ["dm_DanToc_003"]: "Tên tiếng Trung đã tồn tại",
  ["dm_DanToc_004"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_DanToc_005"]: "Tên tiếng Hàn đã tồn tại",
  //Khu vực địa lý
  ["dm_KhuVucDiaLy_001"]: "Mã đã tồn tại",
  ["Admin_KhuVucDiaLy_200"]: "Sai dữ liệu",
  ["dm_KhuVucDiaLy_002"]: "Tên đã tồn tại",
  ["dm_KhuVucDiaLy_003"]: "Tên tiếng Anh đã tồn tại",
  ["dm_KhuVucDiaLy_004"]: "Tên tiếng Trung đã tồn tại",
  ["dm_KhuVucDiaLy_005"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_KhuVucDiaLy_006"]: "Tên tiếng Hàn đã tồn tại",
  //Căn cứ pháp lý
  ["Admin_CanCuPhapLy_000"]: "Văn bản đang được sử dụng",
  ["Admin_CanCuPhapLy_001"]:
    "Đã tồn tại văn bản có cùng Số ký hiệu, Cơ quan ban hành và Ngày ban hành trên hệ thống.",
  ["Admin_CanCuPhapLy_002"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_CanCuPhapLy_003"]: "Loại văn bản không tồn tại",
  ["Admin_CanCuPhapLy_004"]: "Lĩnh vực không tồn tại",
  ["Admin_CanCuPhapLy_005"]: "Đơn vị không tồn tại",
  ["Admin_CanCuPhapLy_006"]: "Loại quan hệ không tồn tại",
  ["Admin_CanCuPhapLy_007"]: "Văn bản liên quan không tồn tại",
  ["Admin_CanCuPhapLy_008"]: "Văn bản liên quan trùng lặp",
  ["Admin_CanCuPhapLy_009"]:
    "Loại quan hệ này là thụ động (cột phải), không được nhập tay",
  ["Admin_CanCuPhapLy_010"]: "Số ký hiệu không được chứa khoảng trắng",
  ["Admin_CanCuPhapLy_011"]:
    "Văn bản đã bị hết hiệu lực bởi một văn bản khác, không thể chuyển sang trạng thái Đang hiệu lực.",
  ["Admin_CanCuPhapLy_012"]: "Số ký hiệu là bắt buộc",
  ["Admin_CanCuPhapLy_013"]: "Trích yếu là bắt buộc",
  ["Admin_CanCuPhapLy_014"]: "Cơ quan ban hành là bắt buộc",
  ["Admin_CanCuPhapLy_015"]: "Ngày ban hành là bắt buộc",
  ["Admin_CanCuPhapLy_016"]: "Ngày ban hành không được là ngày trong tương lai",
  ["Admin_CanCuPhapLy_017"]: "Ngày có hiệu lực không được trước ngày ban hành",
  ["Admin_CanCuPhapLy_018"]: "Số ký hiệu không được vượt quá 200 ký tự",
  ["Admin_CanCuPhapLy_019"]: "Trích yếu không được vượt quá 1000 ký tự",
  ["Admin_CanCuPhapLy_020"]: "Cơ quan ban hành không được vượt quá 500 ký tự",
  ["Admin_CanCuPhapLy_021"]: "Người ký không được vượt quá 200 ký tự",
  ["Admin_CanCuPhapLy_022"]: "Loại quan hệ văn bản không hợp lệ (Id phải > 0)",
  ["Admin_CanCuPhapLy_023"]: "Nhóm quan hệ không có văn bản liên quan",
  ["Admin_CanCuPhapLy_024"]: "ID văn bản liên quan không hợp lệ (phải > 0)",
  ["Admin_CanCuPhapLy_025"]:
    "Số ký hiệu đã bị văn bản khác sử dụng, yêu cầu từ chối để người gửi chỉnh sửa lại",
  ["Admin_CanCuPhapLy_026"]: "Bản nháp này không ở trạng thái chờ duyệt",
  ["Admin_CanCuPhapLy_027"]: "Văn bản gốc không còn tồn tại, không thể duyệt",
  ["Admin_CanCuPhapLy_028"]: "Lý do từ chối là bắt buộc",
  ["Admin_CanCuPhapLy_029"]: "Lý do từ chối phải có ít nhất 10 ký tự",
  ["Admin_CanCuPhapLy_030"]: "Lý do từ chối không được vượt quá 500 ký tự",
  ["Admin_CanCuPhapLy_031"]: "Đã có bản nháp khác được duyệt",
  ["Admin_CanCuPhapLy_032"]: "Loại văn bản không hoạt động, không thể gán",
  ["Admin_CanCuPhapLy_033"]: "Lĩnh vực văn bản không hoạt động, không thể gán",
  ["Admin_CanCuPhapLy_034"]: "Đơn vị soạn thảo không hoạt động, không thể gán",
  ["Admin_CanCuPhapLy_035"]: "Cơ quan ban hành không hoạt động, không thể gán",
  ["Admin_CanCuPhapLy_036"]:
    " Bản nháp này đã được duyệt, không thể chỉnh sửa hoặc xóa",
  ["Admin_CanCuPhapLy_037"]:
    "Tài khoản không thuộc 2 vai trò quản lý kho văn bản",
  ["Admin_CanCuPhapLy_038"]: "Tài khoản địa phương chưa có tỉnh/root tỉnh",
  ["Admin_CanCuPhapLy_039"]: "Cơ quan ban hành không đúng cấp của tài khoản",
  ["Admin_CanCuPhapLy_040"]: "Xã/phường không thuộc tỉnh của tài khoản",
  ["Admin_CanCuPhapLy_041"]: " Tài khoản chưa thuộc đơn vị",
  ["Admin_CanCuPhapLy_042"]: " Đơn vị của tài khoản không tồn tại hoặc không còn hoạt động",
  ["Admin_CanCuPhapLy_043"]: " Đơn vị chưa được cấu hình cấp đơn vị",
  ["Admin_CanCuPhapLy_044"]: "Cấp đơn vị không tồn tại hoặc ngừng hoạt động",
  ["Admin_CanCuPhapLy_045"]: " Đơn vị địa phương chưa có tỉnh thành phố hợp lệ",
  ["Admin_CanCuPhapLy_046"]: "Không xác định được phạm vi dữ liệu từ đơn vị",
  ["Admin_CanCuPhapLy_047"]: "Phiên bản tỉnh thành hiện tại đang hết hiệu lực",
  ["Admin_CanCuPhapLy_048"]: "Phiên bản xã phường hiện tại đang hết hiệu lực",
  ["Admin_CanCuPhapLy_049"]: "Tỉnh thành phố không hoạt động",
  ["Admin_CanCuPhapLy_050"]: "Xã phường không hoạt động",
  ["Admin_CanCuPhapLy_051"]: " Ngày hết hiệu lực không được trước ngày ban hành",
  ["Admin_CanCuPhapLy_052"]: "Ngày hết hiệu lực không được trước ngày có hiệu lực",
  



  //Ngành kinh tế
  ["Admin_NganhKinhTe_000"]: "Tên ngành kinh tế đã tồn tại",
  ["Admin_NganhKinhTe_001"]: "Mã ngành kinh tế đã tồn tại",
  ["Admin_NganhKinhTe_002"]: "VSIC đã tồn tại",
  ["Admin_NganhKinhTe_003"]: "Cấp cha không hợp lệ",
  ["Admin_NganhKinhTe_004"]: "Tên tiếng Anh đã tồn tại!",
  ["Admin_NganhKinhTe_005"]: "Tên tiếng Trung đã tồn tại!",
  ["Admin_NganhKinhTe_006"]: "Tên tiếng Nhật đã tồn tại!",
  ["Admin_NganhKinhTe_007"]: "Tên tiếng Hàn đã tồn tại!",
  //ISIC
  ["Admin_ISIC_000"]: "Tên ISIC đã tồn tại",
  ["Admin_ISIC_001_EN"]: "Tên tiếng Anh ISIC đã tồn tại",
  ["Admin_ISIC_001_CN"]: "Tên tiếng Trung ISIC đã tồn tại",
  ["Admin_ISIC_001_JP"]: "Tên tiếng Nhật ISIC đã tồn tại",
  ["Admin_ISIC_001_KR"]: "Tên tiếng Hàn ISIC đã tồn tại",
  ["Admin_ISIC_002"]: "Mã ISIC đã tồn tại",
  ["Admin_ISIC_003"]: "Không thể xóa ISIC vì có dữ liệu con",
  ["Admin_ISIC_004"]: "ISIC không hoạt động, không thể gán",

  ["Admin_CoQuanBanHanh_000"]: "Mã đã tồn tại",
  ["Admin_CoQuanBanHanh_001"]: "Tên đã tồn tại",
  ["Admin_CoQuanBanHanh_002"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_CoQuanBanHanh_003"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_CoQuanBanHanh_004"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_CoQuanBanHanh_005"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_CoQuanBanHanh_006"]: "Cấp cơ quan ban hành không hợp lệ",
  ["Admin_CoQuanBanHanh_007"]:
    "Cơ quan ban hành đang được sử dụng, không thể xoá!",
  ["Admin_CoQuanBanHanh_008"]: "Cơ quan ban hành không tồn tại",

  //Thành phần kinh tế
  ["Admin_ThanhPhanKinhTe_000"]: "Mã thành phần kinh tế đã tồn tại",
  ["Admin_ThanhPhanKinhTe_001"]: "Tên thành phần kinh tế đã tồn tại",
  ["Admin_ThanhPhanKinhTe_002"]: "Tên tiếng Anh thành phần kinh tế đã tồn tại",
  ["Admin_ThanhPhanKinhTe_003"]:
    "Tên tiếng Trung thành phần kinh tế đã tồn tại",
  ["Admin_ThanhPhanKinhTe_004"]: "Tên tiếng Nhật thành phần kinh tế đã tồn tại",
  ["Admin_ThanhPhanKinhTe_005"]: "Tên tiếng Hàn thành phần kinh tế đã tồn tại",
  ["Admin_XaPhuong_008"]: "Tỉnh Thành phố không hoạt động, không thể gán",
  ["Admin_XaPhuong_009"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_XaPhuong_010"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_XaPhuong_011"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_XaPhuong_012"]: "Phường hết hiệu lực, không thể gán!",
  ["Admin_XaPhuong_013"]: "Xã phường không hoạt động, không thể gán!",
  ["Admin_TinhThanh_QuocGia_008"]: "Quốc gia không hoạt động, không thể gán",
  ["Admin_NganhKinhTe_008"]: "ISIC không hoạt động, không thể gán",
  ["Admin_NganhKinhTe_009"]: "Ngành kinh tế không hoạt động, không thể gán",
  ["Admin_NganhKinhTe_010"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_NganhKinhTe_011"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_NganhKinhTe_012"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_NganhKinhTe_013"]: "Mã NKT cha hết hiệu lực, không thể gán!",
  ["Admin_NganhKinhTe_014"]: "Phát hiện tham chiếu vòng trong cấu trúc cây",
  ["Admin_NganhKinhTe_015"]:
    "Ngành kinh tế cha hết hiệu lực, không thể gán!",
  ["Admin_HeThongNSP_017"]: "Hệ thống NSP không hoạt động, không thể gán",
  ["Admin_HeThongNSP_018"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_HeThongNSP_019"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_HeThongNSP_020"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_HeThongNSP_021"]: "Mã NSP cha hết hiệu lực, không thể gán!",
  ["Admin_HeThongNSP_022"]:
    "Hệ thống ngành sản phẩm cha hết hiệu lực, không thể gán!",
  ["Admin_EBOPS_017"]: "Mã EBOPS cha không hoạt động, không thể gán",
  ["Admin_SITC_017"]: "Mã SITC cha không hoạt động, không thể gán",
  ["Admin_ISIC_001"]: "Mã ISIC đã tồn tại",
  // ["Admin_ISIC_002"]: "Không thể xóa ISIC vì có dữ liệu con",
  //Thành phần kinh tế
  // ["Admin_ThanhPhanKinhTe_000"]: "Tên thành phần kinh tế đã tồn tại",
  // ["Admin_ThanhPhanKinhTe_001"]: "Mã thành phần kinh tế đã tồn tại",
  //Đơn vị tính
  ["Admin_DonViTinh_000"]: "Tên đơn vị tính đã tồn tại",
  ["Admin_DonViTinh_001"]: "Mã đơn vị tính đã tồn tại",
  ["Admin_DonViTinh_002"]: " Tên tiếng Anh đơn vị tính đã tồn tại",
  ["Admin_DonViTinh_003"]: "Tên tiếng Trung đơn vị tính đã tồn tại",
  ["Admin_DonViTinh_004"]: "Tên tiếng Nhật đơn vị tính đã tồn tại",
  ["Admin_DonViTinh_005"]: "Tên tiếng Hàn đơn vị tính đã tồn tại",
  ["Admin_DonViTinh_006"]: "Danh mục đang được sử dụng",
  //Quốc tịch
  ["Admin_QuocTich_000"]: "Mã quốc tịch đã tồn tại",
  ["Admin_QuocTich_001"]: "Mã quốc tịch bắt buộc nhập",
  ["Admin_QuocTich_002"]: "Tên quốc tịch bắt buộc nhập",
  ["Admin_QuocTich_003"]: "Danh mục đang được sử dụng, không thể xóa",
  ["Admin_QuocTich_004"]: "Tên quốc tịch đã tồn tại",
  ["Admin_QuocTich_005"]: "Tên tiếng Anh quốc tịch đã tồn tại",
  ["Admin_QuocTich_006"]: "Tên tiếng Trung quốc tịch đã tồn tại",
  ["Admin_QuocTich_007"]: "Tên tiếng Nhật quốc tịch đã tồn tại",
  ["Admin_QuocTich_008"]: "Tên tiếng Hàn quốc tịch đã tồn tại",
  //Chuyên viên KKT
  ["Admin_ChuyenVienKKT_000"]: "Mã chuyên viên KKT đã tồn tại",
  //Phòng ban KKT
  ["Admin_PhongBanKKT_000"]: "Mã phòng ban KKT đã tồn tại",
  //Khu kinh tế
  ["Admin_KhuKinhTe_000"]: "Mã khu kinh tế đã tồn tại",
  //Chuyên viên Sở KHĐT
  ["Admin_ChuyenVienSoKHDT_000"]: "Mã chuyên viên Sở KHĐT đã tồn tại",
  //Phòng ban Sở KHĐT
  ["Admin_PhongBanSoKHDT_000"]: "Mã phòng ban Sở KHĐT đã tồn tại",
  //Nhà đầu tư
  ["Admin_NhaDauTu_000"]: "Mã nhà đầu tư đã tồn tại",
  ["Admin_NhaDauTu_001"]: "Mã bắt buộc",
  ["Admin_NhaDauTu_002"]: "Tên bắt buộc",
  ["Admin_NhaDauTu_003"]: "Nhà đầu tư không tồn tại",
  ["Admin_NhaDauTu_004"]: "Tên đã tồn tại",
  ["Admin_NhaDauTu_005"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_NhaDauTu_006"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_NhaDauTu_007"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_NhaDauTu_008"]: "Tên tiếng Hàn đã tồn tại",
  //Loại hồ sơ
  ["Admin_LoaiHoSo_000"]: "Danh mục đang được sử dụng",
  ["Admin_LoaiHoSo_001"]: "Tên loại hồ sơ đã tồn tại",
  //Lĩnh vực ưu đãi
  ["Admin_LinhVucUuDai_000"]: "Mã lĩnh vực ưu đãi đã tồn tại",
  ["Admin_LinhVucUuDai_001"]:
    "Không thể xóa Lĩnh vực ưu đãi vì đang được sử dụng",
  ["Admin_LinhVucUuDai_002"]: "Tên lĩnh vực ưu đãi đã tồn tại",
  ["Admin_LinhVucUuDai_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_LinhVucUuDai_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_LinhVucUuDai_005"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_LinhVucUuDai_006"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_LinhVucUuDai_007"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LinhVucUuDai_008"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LinhVucUuDai_009"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LinhVucUuDai_010"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LinhVucUuDai_011"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LinhVucUuDai_012"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  //Quản lý bài viết - Bài viết soạn thảo
  ["BaiVietSoanThao_Common_500"]:
    "Máy chủ lỗi (500): Không thể xử lý yêu cầu, vui lòng thử lại sau",
  ["BaiVietSoanThao_Conmon_404"]: "Không tồn tại",
  ["BaiVietSoanThao_Common_400"]: "Dữ liệu không hợp lệ",

  //Xác thực tài khoản
  ["Admin_CNTC_TaiKhoan_101"]:
    "Thiếu dữ liệu các trường bắt buộc (loại tài khoản, tên, CCCD, nơi cấp, MST hoặc mật khẩu)",
  ["Admin_CNTC_TaiKhoan_100"]:
    "Sai dữ liệu các trường (loại tài khoản, tên, CCCD, nơi cấp, MST hoặc mật khẩu)",
  ["Admin_CNTC_TaiKhoan_102"]:
    "Vượt mức giá trị cho phép (loại tài khoản, tên, CCCD, nơi cấp, MST hoặc mật khẩu > 100",
  ["Admin_CNTC_TaiKhoan_103"]: "Thiếu giá trị cho phép (mật khẩu)",
  ["Admin_CNTC_TaiKhoan_104"]: "Dữ liệu đã tồn tại (CCCD, MST)",
  ["Admin_CNTC_ThongTinTaiKhoan_201"]:
    "Thiếu dữ liệu (Email hoặc số điện thoại)",
  ["Admin_CNTC_ThongTinTaiKhoan_200"]: "Sai dữ liệu (Email hoặc số điện thoại)",
  ["Admin_CNTC_ThongTinTaiKhoan_202"]:
    "Vượt mức giá trị cho phép (Email hoặc số điện thoại)",
  ["Admin_CNTC_ThongTinTaiKhoan_205"]: "Email đã tồn tại",
  ["Admin_CNTC_ThongTinTaiKhoan_206"]: "Số điện thoại đã tồn tại",
  ["Admin_CNTC_ThongTinTaiKhoan_207"]: "Số CCCD/CMND đã tồn tại",
  ["Admin_CNTC_TaiKhoanToken_201"]: "Tài khoản xác thực thất bại.",
  ["Admin_CNTC_TaiKhoanToken_202"]: "Không tìm thấy token.",
  ["Admin_CNTC_TaiKhoanToken_203"]:
    "Tài khoản đã xác thực trước đó. Bạn có thể đăng nhập ngay.",
  ["Admin_CNTC_TaiKhoanToken_205"]: "Sai trạng thái tài khoản.",
  // NV_hồ sơ
  ["NV_HoSo_009"]: "Hồ sơ đang ở trong quy trình rút, không thể thao tác!",
  // NV_Xin Ý Kiến
  ["Admin_DonViYKien_000"]: "Hồ sơ không tồn tại hoặc đã bị xóa",
  ["Admin_DonViYKien_001"]: "Vui lòng chọn ít nhất một đơn vị",
  ["Admin_DonViYKien_002"]:
    "Hạn trả lời không hợp lệ (phải lớn hơn hoặc bằng ngày hiện tại)",
  ["Admin_DonViYKien_003"]: "Thông tin đơn vị không hợp lệ",
  ["Admin_DonViYKien_004"]:
    "Hồ sơ không ở trạng thái Cho xử lý / Chờ lấy ý kiến",
  ["Admin_DonViYKien_005"]: "Ý kiến không tồn tại hoặc đã bị xóa",
  ["Admin_DonViYKien_006"]: " Ý kiến không ở trạng thái Cho phản hồi",
  // NV_Từ chối hồ sơ
  ["User_Nv_TuChoiHoSo_000"]:
    "Hồ sơ không ở trạng thái Cho xử lý / Chờ lấy ý kiến",

  // NV_PhanCong
  ["User_NV_HoSoKhongTonTai_000"]: "Hồ sơ không tồn tại",
  ["User_NV_CanBoKhongTonTai_001"]: "Cán bộ không tồn tại",
  ["User_NV_DonViKhongTonTai_002"]: "Đơn vị không tồn tại",
  ["User_NV_ChuaChonCanBo_003"]: "Chưa chọn cán bộ xử lý",
  ["User_NV_ChiDuocChonMotChuTri_004"]: "Chỉ được chọn một cán bộ chủ trì",
  ["User_NV_PhaiCoCanBoChuTri_005"]: "Phải có cán bộ chủ trì",
  ["User_NV_NhapNoiDungChiDao_006"]: "Vui lòng nhập nội dung chỉ đạo",
  ["User_NV_KhongCoQuyenPhanCong_007"]: "Không có quyền phân công",
  ["User_NV_PhanCongKhongTonTai_008"]: "Phân công không tồn tại",
  ["User_NV_KhongDuocTuPhanCong_009"]: "Không được tự phân công cho bản thân",
  ["User_NV_KhongTimThayNguoiDungDau_010"]:
    "Không tìm thấy người đứng đầu đơn vị",
  // NV_YeuCauBoSung
  // ["Admin_YeuCauBoSung_000"]: "Hồ sơ không tồn tại",
  // ["Admin_YeuCauBoSung_001"]: "Vui lòng nhập lý do yêu cầu bổ sung",
  ["Admin_YeuCauBoSung_002"]: " Hạn bổ sung phải lớn hơn hiện tại",
  // ["Admin_YeuCauBoSung_003"]: "Bạn không có quyền xử lý hồ sơ này",
  // ["Admin_YeuCauBoSung_004"]: "Hồ sơ không ở trạng thái Cho xử lý",
  // NV_TraLai
  ["Admin_TraLaiHoSo_000"]: "Hồ sơ không tồn tại hoặc đã bị xóa",
  ["Admin_TraLaiHoSo_001"]: "Vui lòng chọn người nhận hồ sơ trả lại",
  ["Admin_TraLaiHoSo_002"]: "Vui lòng nhập chọn lý do trả lại",
  ["Admin_TraLaiHoSo_003"]: "Lý do trả lại vượt quá độ dài cho phép",
  ["Admin_TraLaiHoSo_004"]: "Không có thẩm quyền thực hiện",
  //NV_TuChoiPheDuyet
  ["User_NV_MaHoSoKhongHopLe_000"]: "Hồ sơ không tồn tại",
  ["User_NV_VuiLongNhapLyDoTuChoi_001"]:
    " Vui lòng nhập lý do từ chối phê duyệt",
  ["User_NV_Hosonaydabituchoitruocdo_002"]:
    "Hồ sơ này đã bị từ chối phê duyệt trước đó",
  ["User_NV_HoSoKhongOTrangThaiChoDuyet_003"]:
    "Hồ sơ không ở trạng thái chờ duyệt",
  ["User_NV_KhongCoQuyenTuChoiPheDuyet_004"]:
    "Chỉ lãnh đạo của đơn vị xử lý mới có quyền từ chối phê duyệt",
  ["User_NV_ThongTinTuChoiKhongTonTai_005"]:
    "Không tìm thấy thông tin từ chối phê duyệt cho hồ sơ này",

  // NV_Trinh
  ["User_NV_TrinhPheDuyet_000"]: "Hồ sơ không tồn tại",
  ["User_NV_TrinhPheDuyet_001"]:
    "Không tìm thấy thông tin trình phê duyệt cho hồ sơ này",
  ["User_NV_TrinhPheDuyet_002"]: "Nội dung trình phê duyệt không được để trống",
  ["User_NV_TrinhPheDuyet_003"]: "Hồ sơ đã được trình phê duyệt",
  ["User_NV_TrinhPheDuyet_004"]: "Hồ sơ không ở trạng thái Chờ trình phê duyệt",
  ["User_NV_TrinhPheDuyet_005"]: "Bạn không có quyền trình phê duyệt hồ sơ này",
  ["User_NV_TrinhPheDuyet_006"]:
    "Cán bộ lãnh đạo không hợp lệ hoặc không đúng quy trình trình phê duyệt",
  ["User_NV_TrinhPheDuyet_007"]:
    " Ý kiến của các đơn vị chưa hoàn thành, không thể trình phê duyệt",

  // Danh mục FAQs (Chủ đề & Câu hỏi)
  ["Admin_FAQs_000"]: "Mã chủ đề đã tồn tại",
  ["Admin_FAQs_001"]: "Mã câu hỏi đã tồn tại",
  ["Admin_FAQs_002"]: "Tên chủ đề đã tồn tại",
  ["Admin_FAQs_003"]: "Tên chủ đề tiếng Trung đã tồn tại",
  ["Admin_FAQs_004"]: "Tên chủ đề tiếng Anh đã tồn tại",
  ["Admin_FAQs_005"]: "Tên chủ đề tiếng Nhật đã tồn tại",
  ["Admin_FAQs_006"]: "Tên chủ đề tiếng Hàn đã tồn tại",
  ["Admin_FAQs_007"]: "Tên câu hỏi đã tồn tại",
  ["Admin_FAQs_008"]: "Tên câu hỏi tiếng Trung đã tồn tại",
  ["Admin_FAQs_009"]: "Tên câu hỏi tiếng Anh đã tồn tại",
  ["Admin_FAQs_010"]: "Tên câu hỏi tiếng Nhật đã tồn tại",
  ["Admin_FAQs_011"]: "Tên câu hỏi tiếng Hàn đã tồn tại",
  //NV_TraLaiMotCua
  ["Admin_TraLaiMotCua_000"]: "Hồ sơ không tồn tại",
  ["Admin_TraLaiMotCua_001"]: "Không tìm thấy người nhận",
  ["Admin_TraLaiMotCua_002"]: "Vui lòng nhập, chọn lý do trả lại",
  ["Admin_TraLaiMotCua_003"]: "Lý do trả lại quá dài",
  ["Admin_TraLaiMotCua_004"]: "Không có thẩm quyền thực hiện",
  ["Admin_TraLaiMotCua_005"]: "Hồ sơ đang ở trạng thái dừng xử lý",
  ["Admin_TraLaiMotCua_006"]: "Vui lòng nhập lý do trả lại một cửa",
  //NV_TraKetQua
  ["Admin_Nv_HoSo_000"]: "Hồ sơ không đủ điều kiện trả kết quả",

  ["NV_HoSo_000"]: "Hồ sơ đã có đơn vị xử lý",
  ["NV_HoSo_001"]: "Hồ sơ đã tồn tại",
  //Đơn vị soạn thảo vbqppl
  ["Admin_DonViSoanThao_000"]: "Mã đơn vị soạn thảo đã tồn tại",
  ["Admin_DonViSoanThao_001"]: "Tên đã tồn tại",
  ["Admin_DonViSoanThao_002"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_DonViSoanThao_003"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_DonViSoanThao_004"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_DonViSoanThao_005"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_DonViSoanThao_006"]: "Tồn tại khóa ngoại văn bản pháp quy",
  ["Admin_DonViSoanThao_007"]: " Đơn vị soạn thảo không tồn tại",
  //Lĩnh vực văn bản vbqppl
  ["Admin_LinhVucVanBan_000"]: "Mã lĩnh vực văn bản đã tồn tại",
  ["Admin_LinhVucVanBan_001"]: "Tên lĩnh vực đã tồn tại",
  ["Admin_LinhVucVanBan_002"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_LinhVucVanBan_003"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_LinhVucVanBan_004"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_LinhVucVanBan_005"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_LinhVucVanBan_006"]: "Tồn tại khóa ngoại văn bản pháp quy",
  ["Admin_LinhVucVanBan_007"]: "Lĩnh vực văn bản không tồn tại",
  //Loại văn bản pháp luật vbqppl
  ["Admin_LoaiVanBanPhapLuat_000"]: "Mã loại văn bản đã tồn tại",
  ["Admin_LoaiVanBanPhapLuat_001"]: "Tên tiếng Việt đã tồn tại",
  ["Admin_LoaiVanBanPhapLuat_002"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_LoaiVanBanPhapLuat_003"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_LoaiVanBanPhapLuat_004"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_LoaiVanBanPhapLuat_005"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_LoaiVanBanPhapLuat_006"]: "Tồn tại khóa ngoại văn bản pháp quy",
  ["Admin_LoaiVanBanPhapLuat_007"]: "Danh mục đang được sử dụng",
  //Loại văn bản / Kết quả giải quyết
  ["Admin_LoaiVanBan_000"]: "Mã kết quả giải quyết đã tồn tại",
  ["Admin_LoaiVanBan_001"]:
    "Không thể xóa vì kết quả giải quyết đang được sử dụng",
  ["Admin_LoaiVanBan_002"]: "Tên kết quả giải quyết đã tồn tại",
  ["Admin_LoaiVanBan_003"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_LoaiVanBan_004"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_LoaiVanBan_005"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_LoaiVanBan_006"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_LoaiVanBan_007"]: "Không tồn tại loại văn bản",
  ["Admin_LoaiVanBan_008"]: "Không tồn tại quan hệ ngược",
  ["Admin_LoaiVanBan_009"]: "Trùng mã quan hệ ngược",
  ["Admin_LoaiVanBan_010"]: "Quan hệ ngược đang sử dụng",
  ["Admin_LoaiVanBan_011"]: "Mã loại văn bản không đúng định dạng",
  //Thứ bậc pháp lý
  ["Admin_ThuBacPhapLy_000"]: "Mã thứ bậc pháp lý đã tồn tại",
  ["Admin_ThuBacPhapLy_001"]: "Tên thứ bậc pháp lý đã tồn tại",
  ["Admin_ThuBacPhapLy_002"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_ThuBacPhapLy_003"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_ThuBacPhapLy_004"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_ThuBacPhapLy_005"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_ThuBacPhapLy_006"]: "Tổ hợp (Loại văn bản + Cơ quan) đã tồn tại",
  ["Admin_ThuBacPhapLy_007"]: "Loại văn bản pháp quy không tồn tại",
  ["Admin_ThuBacPhapLy_008"]: "Cơ quan ban hành không tồn tại",
  ["Admin_ThuBacPhapLy_009"]: "Cấp bậc không hợp lệ, phải từ 1 đến 100",
  ["Admin_ThuBacPhapLy_010"]: "Trùng tổ hợp loại văn bản và cơ quan ban hành",
  ["Admin_ThuBacPhapLy_011"]: "Trùng thứ bậc pháp lý đã tồn tại",
  ["KHONG_THE_XOA"]: "Thứ bậc pháp lý này không thể xóa",
  ["Admin_ThuBacPhapLy_012"]:
    "Loại văn bản không hoạt động, không thể gán cho thủ tục hành chính",
  ["Admin_ThuBacPhapLy_013"]: "Tên thứ bậc pháp lý không được để trống",
  ["Admin_ThuBacPhapLy_014"]: "Cơ quan ban hành không hoạt động, không thể gán",

  //TiepNhanHoSo
  ["TiepNhanHoSo_DVC_001"]: "Dịch vụ công không tồn tại",
  ["TiepNhanHoSo_DVTN_002"]: "Đơn vị tiếp nhận không tồn tại",
  ["TiepNhanHoSo_DVXL_003"]: "Đơn vị xử lý không tồn tại",
  ["TiepNhanHoSo_LHS_004"]: "Loại hồ sơ không tồn tại",
  ["TiepNhanHoSo_TTP_005"]: "Tỉnh thành phố không tồn tại",
  ["TiepNhanHoSo_TTHS_006"]: "Tỉnh thành phố hồ sơ không tồn tại",
  ["TiepNhanHoSo_GT_007"]: "Giấy tờ hồ sơ không được để trống",
  ["TiepNhanHoSo_DVTN_008"]: "Đơn vị tiếp nhận là bắt buộc",
  ["TiepNhanHoSo_009"]: "Trạng thái tiếp nhận không hợp lệ",
  ["TiepNhanHoSo_XP_010"]: "Xã phường thị trấn không tồn tại",
  ["TiepNhanHoSo_QBD_011"]: "Thiếu tên người nhận hồ sơ",
  ["TiepNhanHoSo_QBD_012"]: "Thiếu số điện thoại người nhận hồ sơ",
  ["TiepNhanHoSo_QBD_013"]: "Thiếu địa chỉ người nhận hồ sơ",
  ["TiepNhanHoSo_QBD_014"]: "Thiếu email người nhận hồ sơ",
  ["TiepNhanHoSo_QBD_015"]: "Thiếu thông tin người nhận hồ sơ",
  //Uỷ quyền
  ["User_NV_UyQuyen_000"]: "Không được phép tự ủy quyền cho chính mình",
  ["User_NV_UyQuyen_001"]:
    "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu",
  ["User_NV_UyQuyen_002"]: "Đơn vị không tồn tại",
  ["User_Nv_DuThaoChuaKySo_007"]: "Chưa ký số!",
  ["User_Nv_CanBoChuaKySoDuThao_008"]: "Cán bộ chưa ký số!",

  //Danh mục XTĐT
  // Loại hoạt động XTĐT
  ["dm_xtdt_LoaiHoatDong_001"]: "Mã loại hoạt động đã tồn tại",
  ["dm_xtdt_LoaiHoatDong_002"]: "Tên loại hoạt động đã tồn tại",
  ["dm_xtdt_LoaiHoatDong_003"]: "Tên tiếng Anh đã tồn tại",
  ["dm_xtdt_LoaiHoatDong_004"]: "Tên tiếng Trung đã tồn tại",
  ["dm_xtdt_LoaiHoatDong_005"]: "Tên tiếng Nhật đã tồn tại",
  ["dm_xtdt_LoaiHoatDong_006"]: "Tên tiếng Hàn đã tồn tại",
  ["dm_xtdt_LoaiHoatDong_007"]:
    "Mã loại hoạt động không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_xtdt_LoaiHoatDong_008"]:
    "Tên loại hoạt động không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_xtdt_LoaiHoatDong_009"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_xtdt_LoaiHoatDong_010"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_xtdt_LoaiHoatDong_011"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_xtdt_LoaiHoatDong_012"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",

  // Phương thức đầu tư
  ["dm_xtdt_PhuongThucDauTu_001"]: "Mã phương thức đầu tư đã tồn tại",
  ["dm_xtdt_PhuongThucDauTu_002"]: "Tên phương thức đầu tư đã tồn tại",
  ["NV_HoSo_007"]:
    "Hồ sơ chưa gắn Dịch vụ công - không thể xác định quy trình xử lý. Vui lòng kiểm tra lại dữ liệu hồ sơ.",
  ["NV_HoSo_008"]:
    "Dịch vụ công chưa được cấu hình quy trình xử lý. Vui lòng cấu hình quy trình trong danh mục trước khi tiếp nhận hồ sơ.",
  // Ngành lĩnh vực
  ["dm_xtdt_NganhLinhVuc_001"]: "Mã ngành lĩnh vực đã tồn tại",
  ["dm_xtdt_NganhLinhVuc_002"]: "Tên ngành lĩnh vực đã tồn tại",

  // Nhà đầu tư
  ["dm_xtdt_NhaDauTu_001"]: "Mã nhà đầu tư đã tồn tại",
  ["dm_xtdt_NhaDauTu_002"]: "Tên nhà đầu tư đã tồn tại",

  // Đối tác đầu tư
  ["dm_xtdt_DoiTacDauTu_001"]: "Mã đối tác đầu tư đã tồn tại",
  ["dm_xtdt_DoiTacDauTu_002"]: "Tên đối tác đầu tư đã tồn tại",

  //KCN Quy hoạch
  // ["dm_KCNQuyHoach_000"]: "Mã khu đã tồn tại",
  // ["dm_KCNQuyHoach_001"]: "Tên khu đã tồn tại",
  // ["dm_KCNQuyHoach_002"]: "Tên tiếng Anh đã tồn tại",
  // ["dm_KCNQuyHoach_003"]: "Tên tiếng Trung đã tồn tại",
  // ["dm_KCNQuyHoach_004"]: "Tên tiếng Nhật đã tồn tại",
  // ["dm_KCNQuyHoach_005"]: "Tên tiếng Hàn đã tồn tại",
  // ["dm_KCNQuyHoach_006"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KCNQuyHoach_007"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KCNQuyHoach_008"]:
  //   "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KCNQuyHoach_009"]:
  //   "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KCNQuyHoach_010"]:
  //   "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KCNQuyHoach_011"]:
  //   "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",

  //KKT Quy hoạch
  // ["dm_KKTQuyHoach_000"]: "Mã khu đã tồn tại",
  // ["dm_KKTQuyHoach_001"]: "Tên khu đã tồn tại",
  // ["dm_KKTQuyHoach_002"]: "Tên tiếng Anh đã tồn tại",
  // ["dm_KKTQuyHoach_003"]: "Tên tiếng Trung đã tồn tại",
  // ["dm_KKTQuyHoach_004"]: "Tên tiếng Nhật đã tồn tại",
  // ["dm_KKTQuyHoach_005"]: "Tên tiếng Hàn đã tồn tại",
  // ["dm_KKTQuyHoach_006"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KKTQuyHoach_007"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KKTQuyHoach_008"]:
  //   "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KKTQuyHoach_009"]:
  //   "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KKTQuyHoach_010"]:
  //   "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  // ["dm_KKTQuyHoach_011"]:
  //   "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_018"]: "Dịch vụ XNK cha không hoạt động, không thể gán",
  ["Admin_DichVuXNK_019"]: "Mã EBOPS không hoạt động, không thể gán",
  ["dm_HangHoaXNK_021"]: "Đơn vị tính không hoạt động, không thể gán",
  ["dm_HangHoaXNK_022"]: "Hàng hoá XNK cha không hoạt động, không thể gán",
  ["Admin_HangHoaXNK_023"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_HangHoaXNK_024"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_HangHoaXNK_025"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_HangHoaXNK_027"]:
    "Hàng hoá XNK cha hết hiệu lực, không thể gán!",
  ["Admin_HinhThucGopVon_007"]: "Đơn vị tính không hoạt động, không thể gán",
  ["Admin_HinhThucGopVon_008"]: "Ngoại tệ không hoạt động, không thể gán",
  ["Admin_HinhThucGopVon_009"]:
    "Ngoại tệ hết hiệu lực, không thể gán!",

  // Hình thức lựa chọn NĐT
  ["dm_xtdt_HinhThucLuaChonNdt_001"]: "Mã hình thức lựa chọn NĐT đã tồn tại",
  ["dm_xtdt_HinhThucLuaChonNdt_002"]: "Tên hình thức lựa chọn NĐT đã tồn tại",

  //Toàn văn
  ["Admin_ToanVan_000"]: "Toàn văn không được chứa thẻ <a name=>",
  ["Admin_ToanVan_001"]: "Danh sách các cấu trúc toàn văn bị lỗi",
  ["Admin_ToanVan_002"]: "Không xác định được cấu trúc của toàn văn",

  // Đối tượng tham gia
  ["Admin_DoiTuongThamGia_000"]: "Mã đối tượng tham gia đã tồn tại",
  ["Admin_DoiTuongThamGia_001"]: "Tên đối tượng tham gia đã tồn tại",

  // Danh mục loại dự án
  ["Admin_LoaiDuAn_000"]: "Mã loại dự án đã tồn tại",
  ["Admin_LoaiDuAn_001"]: "Tên loại dự án đã tồn tại",

  // Khu chức năng
  ["KhuChucNang_000"]: "Mã khu chức năng đã tồn tại",
  ["KhuChucNang_001"]: "Tên khu chức năng đã tồn tại",

  ["dm_ChuDauTu_000"]: "Mã số DN/MST đã tồn tại",
  ["dm_ChuDauTu_001"]: "Tên nhà đầu tư đã tồn tại",
  ["dm_ChuDauTu_002"]: "Tên viết tắt đã tồn tại",
  ["dm_ChuDauTu_003"]: "Tên tiếng anh đã tồn tại",
  ["dm_ChuDauTu_004"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_ChuDauTu_005"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_ChuDauTu_006"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_ChuDauTu_007"]:
    "Tên viết tắt không được có khoảng trắng ở đầu hoặc cuối",

  ["bctt_BaoCaoTuyBien_001"]: "Tên báo cáo đã tồn tại",
  ["bctt_BaoCaoTuyBien_002"]: "Tên báo cáo không được có khoảng trắng ở đầu hoặc cuối",
  ["nv_BangTongHopBoNganh_001"]: "Mã bảng tổng hợp bộ ngành đã tồn tại",
  ["nv_BangTongHopBoNganh_002"]: "Tên bảng tổng hợp bộ ngành đã tồn tại",
  ["nv_BangTongHopBoNganh_003"]: "Mã bảng tổng hợp bộ ngành không được có khoảng trắng ở đầu hoặc cuối",
  ["nv_BangTongHopBoNganh_004"]: "Tên bảng tổng hợp bộ ngành không được có khoảng trắng ở đầu hoặc cuối",

  ["nv_DuAnXTDT_001"]: "Mã danh mục dự án XTDT đã tồn tại",
  ["nv_DuAnXTDT_002"]: "Tên danh mục dự án XTDT đã tồn tại",
  ["nv_DuAnXTDT_003"]: "Mã danh mục dự án XTDT không được có khoảng trắng ở đầu hoặc cuối",
  ["nv_DuAnXTDT_004"]: "Tên danh mục dự án XTDT không được có khoảng trắng ở đầu hoặc cuối",

  ["nv_VanBanDuKienBoNganh_001"]: "Mã văn bản dự kiến bộ ngành đã tồn tại",
  ["nv_VanBanDuKienBoNganh_002"]: "Tên văn bản dự kiến bộ ngành đã tồn tại",
  ["nv_VanBanDuKienBoNganh_003"]: "Mã văn bản dự kiến bộ ngành không được có khoảng trắng ở đầu hoặc cuối",
  ["nv_VanBanDuKienBoNganh_004"]: "Tên văn bản dự kiến bộ ngành không được có khoảng trắng ở đầu hoặc cuối",

  ["nv_QuyetDinhThucHienBoNganh_001"]: "Mã quyết định thực hiện bộ ngành đã tồn tại",
  ["nv_QuyetDinhThucHienBoNganh_002"]: "Tên quyết định thực hiện bộ ngành đã tồn tại",
  ["nv_QuyetDinhThucHienBoNganh_003"]: "Mã quyết định thực hiện bộ ngành không được có khoảng trắng ở đầu hoặc cuối",
  ["nv_QuyetDinhThucHienBoNganh_004"]: "Tên quyết định thực hiện bộ ngành không được có khoảng trắng ở đầu hoặc cuối",
  //Hệ thống tích hợp
  ["Admin_th_HeThongNgoai_000"]: "Mã hệ thống đã tồn tại!",
  //Cấu hình điểm kết nối
  ["Admin_th_CauHinhDiemKetNoi_000"]: "Mã cấu hình điểm kết nối đã tồn tại",
  ["Admin_th_CauHinhDiemKetNoi_001"]: "Hệ thống ngoại không tồn tại",
  ["Admin_th_CauHinhDiemKetNoi_002"]:
    "Chưa cấu hình đường dẫn điều hướng cho hệ thống ngoại này",
  ["Admin_th_CauHinhDiemKetNoi_003"]: "Cấu hình đồng bộ không tồn tại",
  ["Admin_th_CauHinhDiemKetNoi_004"]: "Thiếu cấu hình REST",
  ["Admin_th_CauHinhDiemKetNoi_005"]: "Thiếu cấu hình SOAP",
  ["Admin_th_CauHinhDiemKetNoi_006"]: "Thiếu cấu hình GraphQL",
  ["Admin_th_CauHinhDiemKetNoi_007"]: "Thiếu cấu hình Resillence",
  ["Admin_th_CauHinhDiemKetNoi_008"]: "Thiếu thời gian chờ khi hết hạn",
  ["Admin_th_CauHinhDiemKetNoi_009"]: "Thiếu số lần retry tối đa",
  ["Admin_th_CauHinhDiemKetNoi_010"]: "Thiếu thời gian chờ retry",
  ["Admin_th_CauHinhDiemKetNoi_011"]: "Thiếu ngưỡng ngắt mạch",
  ["Admin_th_CauHinhDiemKetNoi_012"]: "Thiếu thời gian ngắt mạch",
  ["Admin_th_CauHinhDiemKetNoi_013"]: "Thiếu cấu hình ánh xạ dữ liệu",
  ["Admin_th_CauHinhDiemKetNoi_014"]:
    "Cấu hình đồng bộ định kỳ không còn hiệu lực",
  ["Admin_th_CauHinhDiemKetNoi_015"]: "Thiếu rule mapping",
  ["Admin_th_CauHinhDiemKetNoi_016"]:
    "Không tìm thấy cấu hình bảng dịch để mapping",
  ["Admin_th_CauHinhDiemKetNoi_017"]: "Trùng output path",
  ["Admin_th_CauHinhDiemKetNoi_018"]: "Output path map sai bảng",
  ["Admin_th_CauHinhDiemKetNoi_019"]:
    "Output path không hợp lệ hoặc không tồn tại cột đích",
  ["Admin_th_CauHinhDiemKetNoi_020"]: "Kết nối thành công",
  ["Admin_th_CauHinhDiemKetNoi_021"]: "Kết nối thất bại",
  ["Admin_th_CauHinhDiemKetNoi_022"]:
    "Kết nối thất bại do quá thời gian (timeout)",
  ["Admin_th_CauHinhDiemKetNoi_023"]: "Thiếu thuộc tính input",
  ["Admin_th_CauHinhDiemKetNoi_024"]: "Thiếu thuộc tính output",
  ["Admin_th_CauHinhDiemKetNoi_025"]: "Kiểu dữ liệu không hợp lệ",
  ["Admin_th_CauHinhDiemKetNoi_026"]: "Biểu thức chuyển đổi không hợp lệ",
  // Api Key
  ["Admin_th_ApiKey_001"]: "Mã Api Key là bắt buộc",
  ["Admin_th_ApiKey_002"]: "Tên Api Key là bắt buộc",
  ["Admin_th_ApiKey_003"]: "Hệ thống là bắt buộc",
  ["Admin_th_ApiKey_004"]: "Ngày hết hạn là bắt buộc",
  ["Admin_th_ApiKey_005"]: "Mã Api Key vượt quá độ dài cho phép",
  ["Admin_th_ApiKey_006"]: "Tên Api Key vượt quá độ dài cho phép",
  ["Admin_th_ApiKey_007"]: "Mô tả vượt quá độ dài cho phép",
  ["Admin_th_ApiKey_008"]: "Mã Api Key không hợp lệ",
  ["Admin_th_ApiKey_009"]: "Tên Api Key không hợp lệ",
  ["Admin_th_ApiKey_010"]: "Loại Api Key không hợp lệ",
  ["Admin_th_ApiKey_011"]: "Ngày hết hạn phải lớn hơn ngày hiện tại",
  ["Admin_th_ApiKey_012"]: "Hệ thống không tồn tại",
  ["Admin_th_ApiKey_013"]: "Mã Api Key đã tồn tại",
  // Địa chỉ được truy cập
  ["Admin_th_DiaChiDuocTruyCap_001"]: "Mã cấu hình là bắt buộc",
  ["Admin_th_DiaChiDuocTruyCap_002"]: "Tên cấu hình là bắt buộc",
  ["Admin_th_DiaChiDuocTruyCap_003"]: "Mã cấu hình vượt quá độ dài cho phép",
  ["Admin_th_DiaChiDuocTruyCap_004"]: "Tên cấu hình vượt quá độ dài cho phép",
  ["Admin_th_DiaChiDuocTruyCap_005"]: "Mã cấu hình không hợp lệ",
  ["Admin_th_DiaChiDuocTruyCap_006"]: "Tên cấu hình không hợp lệ",
  ["Admin_th_DiaChiDuocTruyCap_007"]: "Api Key không tồn tại",
  ["Admin_th_DiaChiDuocTruyCap_008"]: "Mã cấu hình đã tồn tại",
  // Hệ thống
  ["Admin_th_HeThong_001"]: "Mã hệ thống là bắt buộc",
  ["Admin_th_HeThong_002"]: "Tên hệ thống là bắt buộc",
  ["Admin_th_HeThong_003"]: "Mã hệ thống vượt quá độ dài cho phép",
  ["Admin_th_HeThong_004"]: "Tên hệ thống vượt quá độ dài cho phép",
  ["Admin_th_HeThong_005"]: "Mô tả vượt quá độ dài cho phép",
  ["Admin_th_HeThong_006"]: "Mã hệ thống không hợp lệ",
  ["Admin_th_HeThong_007"]: "Tên hệ thống không hợp lệ",
  ["Admin_th_HeThong_008"]: "Phương thức không hợp lệ",
  ["Admin_th_HeThong_009"]: "Mã hệ thống đã tồn tại",
  // Môi trường
  ["Admin_th_MoiTruong_001"]: "Mã môi trường là bắt buộc",
  ["Admin_th_MoiTruong_002"]: "Tên môi trường là bắt buộc",
  ["Admin_th_MoiTruong_003"]: "Mã môi trường vượt quá độ dài cho phép",
  ["Admin_th_MoiTruong_004"]: "Tên môi trường vượt quá độ dài cho phép",
  ["Admin_th_MoiTruong_005"]: "Mô tả vượt quá độ dài cho phép",
  ["Admin_th_MoiTruong_006"]: "Mã môi trường không hợp lệ",
  ["Admin_th_MoiTruong_007"]: "Tên môi trường không hợp lệ",
  ["Admin_th_MoiTruong_008"]: "Mã môi trường đã tồn tại",
  // Phiên bản API
  ["Admin_th_PhienBanAPI_001"]: "Mã phiên bản API là bắt buộc",
  ["Admin_th_PhienBanAPI_002"]: "Tên phiên bản API là bắt buộc",
  ["Admin_th_PhienBanAPI_003"]: "Mã phiên bản API vượt quá độ dài cho phép",
  ["Admin_th_PhienBanAPI_004"]: "Tên phiên bản API vượt quá độ dài cho phép",
  ["Admin_th_PhienBanAPI_005"]: "Mã phiên bản API không hợp lệ",
  ["Admin_th_PhienBanAPI_006"]: "Tên phiên bản API không hợp lệ",
  ["Admin_th_PhienBanAPI_007"]: "Danh mục API không tồn tại",
  ["Admin_th_PhienBanAPI_008"]: "Mã phiên bản API đã tồn tại",
  // Phân quyền API
  ["Admin_th_PhanQuyenAPI_001"]: "Mã phân quyền API là bắt buộc",
  ["Admin_th_PhanQuyenAPI_002"]: "Tên phân quyền API là bắt buộc",
  ["Admin_th_PhanQuyenAPI_003"]: "Mã phân quyền API vượt quá độ dài cho phép",
  ["Admin_th_PhanQuyenAPI_004"]: "Tên phân quyền API vượt quá độ dài cho phép",
  ["Admin_th_PhanQuyenAPI_005"]: "Mã phân quyền API không hợp lệ",
  ["Admin_th_PhanQuyenAPI_006"]: "Tên phân quyền API không hợp lệ",
  ["Admin_th_PhanQuyenAPI_007"]: "Phiên bản API không tồn tại",
  ["Admin_th_PhanQuyenAPI_008"]: "Api Key không tồn tại",
  ["Admin_th_PhanQuyenAPI_009"]: "Mã phân quyền API đã tồn tại",
  // Hợp đồng dịch vụ
  ["Admin_th_HopDongDichVu_001"]: "Mã hợp đồng là bắt buộc",
  ["Admin_th_HopDongDichVu_002"]: "Tên hợp đồng là bắt buộc",
  ["Admin_th_HopDongDichVu_003"]: "Mã hợp đồng vượt quá độ dài cho phép",
  ["Admin_th_HopDongDichVu_004"]: "Tên hợp đồng vượt quá độ dài cho phép",
  ["Admin_th_HopDongDichVu_005"]: "Mã hợp đồng không hợp lệ",
  ["Admin_th_HopDongDichVu_006"]: "Tên hợp đồng không hợp lệ",
  ["Admin_th_HopDongDichVu_007"]: "Phiên bản API không tồn tại",
  ["Admin_th_HopDongDichVu_008"]: "Api Key không tồn tại",
  ["Admin_th_HopDongDichVu_009"]: "Mã hợp đồng đã tồn tại",
  // Công bố dịch vụ
  ["Admin_th_CongBoDichVu_001"]: "Mã công bố dịch vụ là bắt buộc",
  ["Admin_th_CongBoDichVu_002"]: "Tên công bố dịch vụ là bắt buộc",
  ["Admin_th_CongBoDichVu_003"]: "Mã công bố dịch vụ vượt quá độ dài cho phép",
  ["Admin_th_CongBoDichVu_004"]: "Tên công bố dịch vụ vượt quá độ dài cho phép",
  ["Admin_th_CongBoDichVu_005"]: "Mã công bố dịch vụ không hợp lệ",
  ["Admin_th_CongBoDichVu_006"]: "Tên công bố dịch vụ không hợp lệ",
  ["Admin_th_CongBoDichVu_007"]: "Phiên bản API không tồn tại",
  ["Admin_th_CongBoDichVu_008"]: "Môi trường không tồn tại",
  ["Admin_th_CongBoDichVu_009"]: "Mã công bố dịch vụ đã tồn tại",
  // Hồ sơ chia sẻ
  ["Admin_th_HoSoChiaSe_000"]: "Số lượng chia sẻ tối đa phải lớn hơn 0",
  ["Admin_th_HoSoChiaSe_001"]: "Mã danh mục API đã tồn tại",
  ["Admin_th_HoSoChiaSe_002"]: "Bộ lọc không thuộc bộ thông tin đã chọn",
  ["Admin_th_HoSoChiaSe_003"]: "Ngày hết hạn phải lớn hơn ngày hiện tại",
  // kiểu dữ liệu
  ["Admin_th_KieuDuLieu_001"]: "Thiếu mã kiểu dữ liệu",
  ["Admin_th_KieuDuLieu_003"]: "Thiếu điểm kết nối",
  ["Admin_th_KieuDuLieu_004"]: "Điểm kết nối không tồn tại",
  // bảng dữ liệu đồng bộ
  ["Admin_th_BangDuLieu_002"]: "Trùng mã bảng dữ liệu",
  ["Admin_th_BangDuLieu_003"]: "Thiếu mã bảng dữ liệu",
  ["Admin_th_BangDuLieu_004"]: "Thiếu tên bảng dữ liệu",
  ["Admin_th_BangDuLieu_005"]: "Kiểu dữ liệu thuộc tính không hợp lệ",
  ["Admin_th_BangDuLieu_006"]: "Thiếu SQL XML",
  ["Admin_th_BangDuLieu_007"]: "Cấu hình tạo bảng vật lý không hợp lệ",
  ["Admin_th_BangDuLieu_008"]: "Lỗi đồng bộ schema",
  ["Admin_th_BangDuLieu_009"]: "SQL XML không hợp lệ",
  ["Admin_th_BangDuLieu_010"]: "Cấu hình đang được sử dụng, không thể xóa",
  ["Admin_th_BangDuLieu_011"]: "Bảng phụ đang có dữ liệu, không thể xóa",
  ["Admin_th_BangDuLieu_012"]: "Bảng chính đang có dữ liệu, không thể xóa",
  ["Admin_th_BangDuLieu_013"]: "Bảng chính không có dữ liệu",
  ["Admin_th_BangDuLieu_014"]: "Chưa có bảng chính",
  ["Admin_th_BangDuLieu_015"]: "Không thể đổi khóa chính khi bảng đã tạo",
  ["Admin_th_BangDuLieu_016"]: "Không thể xóa cột khi bảng đã có dữ liệu",
  ["Admin_th_BangDuLieu_017"]: "Không thể đổi kiểu cột đã có dữ liệu",
  ["Admin_th_BangDuLieu_018"]: "Không thể set bắt buộc cột đang có NULL",
  ["Admin_th_BangDuLieu_019"]: "Cấu hình tạo bảng vật lý chính không hợp lệ",
  ["Admin_th_BangDuLieu_020"]: "Cấu hình tạo bảng vật lý phụ không hợp lệ",
  ["Admin_th_BangDuLieu_021"]: "Schema không tồn tại",
  ["Admin_th_BangDuLieu_022"]: "Thiếu bảng chính",
  ["Admin_th_BangDuLieu_023"]: "Thiếu thuộc tính",
  ["Admin_th_BangDuLieu_024"]: "Schema không hợp lệ",
  ["Admin_th_BangDuLieu_025"]: "Thiếu bảng phụ",
  ["Admin_th_BangDuLieu_026"]: "Khóa ngoại không hợp lệ",
  ["Admin_th_BangDuLieu_027"]: "Tên thuộc tính không hợp lệ",
  // đồng bộ dữ liệu
  ["Admin_th_DongBoDuLieu_001"]: "Đang có job đồng bộ chưa hoàn thành",
  ["Admin_th_DongBoDuLieu_002"]: "Thiếu điểm kết nối",
  ["Admin_th_DongBoDuLieu_003"]: "Điểm kết nối không hoạt động",
  ["Admin_th_DongBoDuLieu_004"]: "Thiếu bảng dữ liệu",
  ["Admin_th_DongBoDuLieu_005"]: "Đường dẫn data không hợp lệ",
  ["Admin_th_DongBoDuLieu_006"]: "Thiếu đường dẫn data",
  ["Admin_th_DongBoDuLieu_007"]: "Không hỗ trợ format",
  ["Admin_th_DongBoDuLieu_008"]: "Không có cột hợp lệ",
  ["Admin_th_DongBoDuLieu_009"]: "Thiếu định nghĩa bảng database",
  ["Admin_th_DongBoDuLieu_010"]: "Không có dữ liệu đầu vào",
  ["Admin_th_DongBoDuLieu_011"]: "Không có hỗ trợ phân trang",
  ["Admin_th_DongBoDuLieu_012"]: "Thiếu cron expression",
  ["Admin_th_DongBoDuLieu_013"]: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
  ["Admin_th_DongBoDuLieu_014"]: "Cron không hợp lệ",
  ["Admin_th_DongBoDuLieu_015"]: "Không tìm thấy điểm kết nối",
  ["Admin_th_DongBoDuLieu_016"]: "Đồng bộ định kỳ thất bại",
  ["Admin_th_DongBoDuLieu_017"]: "Thiếu cấu hình business key",
  ["Admin_th_DongBoDuLieu_018"]: "Thiếu giá trị business key",
  ["Admin_th_DongBoDuLieu_019"]: "Bản ghi rỗng",
  ["Admin_th_DongBoDuLieu_020"]: "Cột không hợp lệ",
  ["Admin_th_DongBoDuLieu_021"]: "Thiếu khóa chính",
  ["Admin_th_DongBoDuLieu_022"]: "Trùng bản ghi trong batch",
  ["Admin_th_DongBoDuLieu_023"]: "Dữ liệu đầu vào rỗng",
  ["Admin_th_DongBoDuLieu_024"]: "Không có mapping rule",
  ["Admin_th_DongBoDuLieu_025"]: "Rule thiếu input path",
  ["Admin_th_DongBoDuLieu_026"]: "Rule thiếu output path",
  ["Admin_th_DongBoDuLieu_027"]: "Output path không hợp lệ",
  ["Admin_th_DongBoDuLieu_028"]: "Rule đang map sang bảng khác",
  ["Admin_th_DongBoDuLieu_029"]: "Trùng output mapping",
  ["Admin_th_DongBoDuLieu_030"]: "Input path không tồn tại trong dữ liệu mẫu",
  ["Admin_th_DongBoDuLieu_031"]: "Thiếu cấu hình bảng đích",
  ["Admin_th_DongBoDuLieu_032"]: "Thiếu main table",
  ["Admin_th_DongBoDuLieu_033"]: "Main table thiếu primary key",
  ["Admin_th_DongBoDuLieu_034"]: "Thiếu danh sách cột hợp lệ của main table",
  ["Admin_th_DongBoDuLieu_035"]: "Thiếu trường bắt buộc",
  ["Admin_th_DongBoDuLieu_036"]: "Thiếu trường bắt buộc theo cấu hình bảng",
  ["Admin_th_DongBoDuLieu_037"]: "Sai kiểu dữ liệu cột",
  ["Admin_th_DongBoDuLieu_038"]: "Vượt độ dài của cột",
  ["Admin_th_DongBoDuLieu_039"]: "Trùng business key trong batch",
  // kết quả đồng bộ & phê duyệt
  ["Admin_th_KetQuaDongBo_001"]: "Thiếu lý do từ chối",
  ["Admin_th_KetQuaDongBo_002"]: "Thiếu kết quả đồng bộ",
  ["Admin_th_KetQuaDongBo_003"]: "Thiếu cấu hình đồng bộ",
  ["Admin_th_KetQuaDongBo_004"]: "Thiếu business key",
  ["Admin_th_KetQuaDongBo_005"]: "Không được cập nhật trạng thái về chờ duyệt",
  ["Admin_th_KetQuaDongBo_006"]: "Trạng thái phê duyệt không hợp lệ",

  // --- Additional Error Code Translations ---
  ["Common_400_VIE"]: "Danh muc thiếu tên tiếng Việt",
  ["Common_400_ENG"]: "Thiếu tên tiếng Anh",
  ["Common_400_CHN"]: "Thiếu tên tiếng Trung",
  ["Common_400_JPN"]: "Thiếu tên tiếng Nhật",
  ["Common_400_KOR"]: "Thiếu tên tiếng Hàn",
  ["Admin_Print_000"]: "File template Giấy tờ tiếp nhận không tồn tại",
  ["Admin_Print_001"]: "ngày hẹn trả mới phải lớn hơn hoặc bằng ngày cũ",
  ["Common_400_SQL"]: "Không được phép chứa SQL",
  ["Admin_LoaiHinhGiaoDuc_008"]:
    "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LoaiHinhGiaoDuc_009"]:
    "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LoaiHinhGiaoDuc_010"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LoaiHinhGiaoDuc_011"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LoaiHinhGiaoDuc_012"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_LoaiHinhGiaoDuc_013"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_0010"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_DichVuXNK_0011"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_DichVuXNK_012"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_013"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_014"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_015"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_016"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_017"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_DichVuXNK_020"]: "Ngày hiệu lực không hợp lệ",
  ["Admin_DichVuXNK_021"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["Admin_DichVuXNK_022"]: "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_UyBan_006"]: "Danh mục đang được sử dụng",
  ["Admin_UyBan_007"]: "Tên đã tồn tại",
  ["Admin_UyBan_008"]: "Tên tiếng Anh đã tồn tại",
  ["Admin_UyBan_009"]: "Tên tiếng Trung đã tồn tại",
  ["Admin_UyBan_010"]: "Tên tiếng Nhật đã tồn tại",
  ["Admin_UyBan_011"]: "Tên tiếng Hàn đã tồn tại",
  ["Admin_Quocgia_Tochuc_002"]: "Quốc gia đã được gán cho tổ chức quốc tế",
  ["Admin_TinhThanh_VungKinhTe_000"]: "Tỉnh thành đã được gán vào vùng kinh tế",
  ["Admin_TinhThanh_Quocgia_002"]: "Danh mục đang được sử dụng",
  ["Admin_NgayNghi_001"]: "Sai định dạng ngày nghỉ",
  ["Admin_DVC_TiepNhan_000"]:
    "Đơn vị không đủ quyền tiếp nhận dịch vụ công cấp trung ương",
  ["Admin_LinhVuc_007"]:
    "Lĩnh vực đã được sử dụng, không thể chuyển sang trạng thái không hiệu lực.",
  ["Admin_LoaiDoanhNghiep_013"]:
    "Đây không phải phiên bản hẹn lịch không thể xóa",
  ["Admin_SITC_011"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_SITC_012"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_SITC_013"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_SITC_014"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_SITC_015"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_SITC_016"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",

  ["Admin_ChiNhanh_000"]: "Tên chi nhánh đã tồn tại",
  ["Admin_ChiNhanh_001"]: "TênEN chi nhánh đã tồn tại",
  ["Admin_ChiNhanh_002"]: "TênCN chi nhánh đã tồn tại",
  ["Admin_ChiNhanh_003"]: "TênJP chi nhánh đã tồn tại",
  ["Admin_ChiNhanh_004"]: "TênKR chi nhánh đã tồn tại",
  ["Admin_DoanhNghiep_009"]: "Tên doanh nghiệp đã tồn tại",
  ["Admin_DoanhNghiep_010"]: "TênEN doanh nghiệp đã tồn tại",
  ["Admin_DoanhNghiep_011"]: "TênCN doanh nghiệp đã tồn tại",
  ["Admin_DoanhNghiep_012"]: "TênJP doanh nghiệp đã tồn tại",
  ["Admin_DoanhNghiep_013"]: "TênJP doanh nghiệp đã tồn tại",
  ["Admin_DoanhNghiep_014"]: "Không thể xóa Doanh nghiệp đang được sử dụng.",
  ["Admin_DoanhNghiep_015"]: "Mã doanh nghiệp đã tồn tại",
  ["User_PhanAnhKienNghi_000"]: "Số điện thoại không đúng định dạng.",
  ["User_PhanAnhKienNghi_001"]: "Email không đúng định dạng.",
  ["User_PhanAnhKienNghi_002"]: "Họ và tên cá nhân là bắt buộc.",
  ["User_PhanAnhKienNghi_003"]: "Tên doanh nghiệp/tổ chức là bắt buộc.",
  ["User_PhanAnhKienNghi_004"]: "Người đại diện là bắt buộc.",
  ["User_PhanAnhKienNghi_005"]: "Chủ đề PAKN không hợp lệ.",
  ["User_PhanAnhKienNghi_006"]:
    "PAKN không ở trạng thái Lưu nháp, không thể cập nhật.",
  ["User_PhanAnhKienNghi_007"]:
    "Thao tác không hợp lệ với trạng thái hiện tại của phản ánh kiến nghị.",
  ["User_PhanAnhKienNghi_008"]: "Phải chọn phòng ban tiếp nhận xử lý.",
  ["User_PhanAnhKienNghi_009"]: "Phải nhập nội dung yêu cầu bổ sung.",
  ["User_PhanAnhKienNghi_010"]: "Phải chọn cán bộ xử lý.",
  ["User_PhanAnhKienNghi_011"]: "Phải nhập nội dung trả lời PAKN.",
  ["User_PhanAnhKienNghi_012"]: "Phải chọn phòng ban nhận khi chuyển bộ phận.",
  ["User_PhanAnhKienNghi_013"]:
    "Phải chọn đơn vị cần chuyển khi chuyển đơn vị khác.",
  ["User_PhanAnhKienNghi_014"]:
    "PAKN đã được nhận xử lý bởi cán bộ khác, bạn không có quyền thực hiện thao tác này.",
  ["User_PhanAnhKienNghi_015"]:
    "PAKN không đủ điều kiện hủy (đã hoàn thành, đã hủy hoặc đang lưu nháp).",
  ["User_PhanAnhKienNghi_016"]: "Bạn không có quyền hủy PAKN này.",
  ["User_PhanAnhKienNghi_017"]: "Thiếu token reCAPTCHA.",
  ["User_PhanAnhKienNghi_018"]: "Token reCAPTCHA không hợp lệ.",
  ["User_PhanAnhKienNghi_019"]: "Lỗi xác thực reCAPTCHA.",
  ["Thứ bậc pháp lý này không thể xoá"]: "Thứ bậc pháp lý này không thể xóa",
  ["Admin_VanBanLienQuan_000"]: "Văn bản chính không tồn tại",
  ["Admin_VanBanLienQuan_001"]: "Văn bản liên quan không tồn tại",
  ["Admin_VanBanLienQuan_002"]: "Loại quan hệ không tồn tại",
  ["Admin_VanBanLienQuan_003"]: "Quan hệ này đã tồn tại",
  ["Admin_VanBanLienQuan_004"]: "Không thể tạo quan hệ với chính văn bản đó",
  ["Admin_VanBanLienQuan_005"]: "Vi phạm quy tắc thời gian (văn bản tương lai)",
  ["Admin_VanBanLienQuan_006"]: "Vi phạm quy tắc thứ bậc pháp lý",
  ["Quan hệ pháp lý Văn bản sửa đổi không hợp lệ"]:
    "Quan hệ sửa đổi chiều ngược đã tồn tại",
  ["Admin_BaoCao_000"]: "Quý phải từ 1 đến 4 khi chọn báo cáo theo quý",
  ["Admin_BaoCao_001"]: "Tháng phải từ 1 đến 12 khi chọn báo cáo theo tháng",
  ["Admin_BaoCao_002"]:
    "Từ ngày và Đến ngày là bắt buộc khi chọn báo cáo theo ngày",
  ["Admin_BaoCao_003"]: "Từ ngày không được lớn hơn Đến ngày",
  ["Admin_BaoCao_004"]: "loại báo cáo không có sẵn",
  ["GiayToHoSo_001"]: "Mã giấy tờ hồ sơ đã tồn tại",
  ["GiayToHoSo_002"]: "Trùng lặp trường hợp giấy tờ",
  ["GiayToHoSo_003"]: "Trường hợp giấy tờ không tồn tại",
  ["TiepNhanHoSo_TTNN_017"]: "Quốc gia không tồn tại",
  ["TiepNhanHoSo_QBD_016"]: "CCCD không hợp lệ",
  ["TiepNhanHoSo_QG_017"]: "Quốc gia không tồn tại",
  ["NV_HoSo_002"]: "Hồ sơ chưa có kết quả xử lý",
  ["User_NV_HoSo_003"]: "Hồ sơ không ở trạng thái chờ rút",
  ["NV_HoSo_004"]: "Hồ sơ sai trạng thái",
  ["NV_HoSo_005"]: "Đơn vị tiếp nhận không hợp lệ",
  ["NV_HoSo_006"]: "Hồ sơ chưa tiếp nhận",
  ["Admin_TraLaiHoSo_005"]: "Phân công không hợp lệ",
  ["Admin_DungHoSo_000"]: "Hồ sơ không tồn tại hoặc đã bị xóa",
  ["Admin_DungHoSo_001"]: "Vui lòng nhập lý do dừng xử lý",
  ["Admin_DungHoSo_002"]: "Hồ sơ đang ở trạng thái dừng xử lý",
  ["Admin_DungHoSo_003"]: "Hồ sơ không ở trạng thái dừng xử lý",
  ["Admin_DungHoSo_004"]: "Không có thẩm quyền thực hiện",
  ["External_Upload_1690"]: "File không truy cập được",
  ["External_Upload_1686"]: "Ký tự không hợp lệ trong tên file",
  ["dm_HeThongNSP_011"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_HeThongNSP_012"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_HeThongNSP_013"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_HeThongNSP_014"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_HeThongNSP_015"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_HeThongNSP_016"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  ["dm_DanToc_006"]: "Danh mục đang sử dụng",
  ["dm_KhuVucDiaLy_007"]: "Danh mục đang sử dụng",
  ["Admin_GioiTinh_000"]: "Mã giới tính đã tồn tại",
  ["Admin_GioiTinh_001"]: "Mã bắt buộc",
  ["Admin_GioiTinh_002"]: "Tên bắt buộc",
  ["Admin_GioiTinh_003"]: "Tên đã tồn tại",
  ["Admin_GioiTinh_004"]: "TênEN đã tồn tại",
  ["Admin_GioiTinh_005"]: "TênCN đã tồn tại",
  ["Admin_GioiTinh_006"]: "TênJP đã tồn tại",
  ["Admin_GioiTinh_007"]: "TênKR đã tồn tại",
  ["Admin_GioiTinh_008"]: "Mã không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_GioiTinh_009"]: "Tên không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_GioiTinh_010"]:
    "Tên tiếng Anh không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_GioiTinh_011"]:
    "Tên tiếng Trung không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_GioiTinh_012"]:
    "Tên tiếng Nhật không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_GioiTinh_013"]:
    "Tên tiếng Hàn không được có khoảng trắng ở đầu hoặc cuối",
  ["Admin_Auth_001"]: "Sai tài khoản hoặc mật khẩu",
  ["Admin_Auth_002"]: "Tài khoản đang bị khóa bởi admin",
  ["Admin_Auth_003"]: "Tài khoản đang chờ xác thực email",
  ["Admin_Auth_004"]: "Thiếu mật khẩu cũ",
  ["Admin_Auth_005"]: "Thiếu mật khẩu mới",
  ["Admin_Auth_006"]: "Thiếu xác nhận mật khẩu mới",
  ["Admin_Auth_007"]: "Sai mã thông báo",
  ["Admin_Auth_008"]: "Mật khẩu mới và xác nhận mật khẩu mới không khớp",
  ["Admin_Auth_009"]: "Mật khẩu mới không được trùng với mật khẩu cũ",
  ["Admin_Auth_010"]: "Mật khẩu cũ không chính xác",
  ["Admin_Auth_011"]: "Tài khoản đang bị khóa tạm thời",
  ["Admin_Auth_012"]: "Tài khoản bị khóa do đăng nhập sai nhiều lần",
  ["Admin_CNTC_TaiKhoan_105"]: "Số CCCD vượt quá độ dài quy định",
  ["Admin_CNTC_TaiKhoan_106"]: "Nơi cấp vượt quá độ dài cho phép",
  ["Admin_CNTC_TaiKhoan_107"]: "Mã số thuế vượt quá độ dài cho phép",
  ["Admin_CNTC_TaiKhoan_108"]: "Mật khẩu vượt quá độ dài cho phép",
  ["Admin_CNTC_TaiKhoan_109"]: "Mật khẩu không hợp lệ",
  ["Admin_CNTC_TaiKhoan_110"]: "Loại tài khoản không hợp lệ",
  ["Admin_CNTC_TaiKhoan_111"]: "Họ và tên không hợp lệ",
  ["Admin_CNTC_TaiKhoan_112"]: "Số CCCD không hợp lệ",
  ["Admin_CNTC_TaiKhoan_113"]: "Nơi cấp không hợp lệ",
  ["Admin_CNTC_TaiKhoan_114"]: "Mã số thuế không hợp lệ",
  ["Admin_CNTC_TaiKhoan_115"]: "Mật khẩu không hợp lệ",
  ["Admin_CNTC_TaiKhoan_116"]: "Số CCCD đã tồn tại trên hệ thống",
  ["Admin_CNTC_TaiKhoan_117"]: "Mã số thuế đã tồn tại trên hệ thống",
  ["Admin_CNTC_TaiKhoan_118"]:
    "Tài khoản đã được đăng ký trước đó, vui lòng kiểm tra email để xác thực",
  ["Admin_CNTC_TaiKhoan_119"]: "Tài khoản chưa được xác thực email",
  ["Admin_CNTC_ThongTinTaiKhoan_203"]: "Thiếu mã vùng số điện thoại",
  ["Admin_CNTC_ThongTinTaiKhoan_204"]: "Email quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_208"]: "Tên bang/tỉnh quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_209"]: "Mã bưu chính quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_210"]: "Email không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_211"]: "Số điện thoại không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_212"]: "Địa chỉ không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_213"]: "Email đã tồn tại",
  ["Admin_CNTC_ThongTinTaiKhoan_214"]: "Số điện thoại đã tồn tại",
  ["Admin_CNTC_ThongTinTaiKhoan_215"]: "Số điện thoại Việt Nam không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_216"]: "Số điện thoại quốc tế không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_217"]: "Thiếu họ và tên người đại diện",
  ["Admin_CNTC_ThongTinTaiKhoan_218"]: "Thiếu email người đại diện",
  ["Admin_CNTC_ThongTinTaiKhoan_219"]: "Thiếu số điện thoại người đại diện",
  ["Admin_CNTC_ThongTinTaiKhoan_220"]: "Thiếu địa chỉ người đại diện",
  ["Admin_CNTC_ThongTinTaiKhoan_221"]:
    "Thiếu mã vùng số điện thoại người đại diện",
  ["Admin_CNTC_ThongTinTaiKhoan_222"]: "Email người đại diện quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_223"]: "Số điện thoại người đại diện quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_224"]: "Địa chỉ người đại diện quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_225"]: "Email người đại diện không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_226"]:
    "Số điện thoại người đại diện không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_227"]: "Địa chỉ người đại diện không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_228"]: "Email người đại diện đã tồn tại",
  ["Admin_CNTC_ThongTinTaiKhoan_229"]:
    "Số điện thoại người đại diện đã tồn tại",
  ["Admin_CNTC_ThongTinTaiKhoan_230"]:
    "Số điện thoại Việt Nam của người đại diện không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_231"]:
    "Số điện thoại quốc tế của người đại diện không hợp lệ",
  ["Admin_CNTC_ThongTinTaiKhoan_232"]: "Họ và tên người đại diện quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_233"]: "Mã định danh người đại diện quá dài",
  ["Admin_CNTC_ThongTinTaiKhoan_234"]: "Thiếu mã định danh người đại diện",
  ["Admin_CNTC_ThongTinTaiKhoan_235"]: "Ngày sinh không được lớn hơn ngày cấp",
  ["Admin_CNTC_ThongTinTaiKhoan_236"]:
    "Mã định danh người đại diện không hợp lệ",
  ["Admin_DonViYKien_007"]:
    "Chỉ người phân công cuối cùng mới có quyền cập nhật ý kiến",
  ["Admin_DonViYKien_008"]:
    "Hồ sơ đang ở trạng thái rút hồ sơ, không cho phép thao tác với ý kiến",
  ["Admin_DuThaoHoSo_000"]: "Hồ sơ không tồn tại",
  ["Admin_DuThaoHoSo_001"]: "Bạn không có quyền xử lý hồ sơ này",
  ["User_NV_HoSoDaPheDuyet_002"]: "Hồ sơ đã phê duyệt",
  ["User_Nv_HoSoKhongTrongTrangThaiChoDuyet_003"]:
    "Hồ sơ không trong trạng thái chờ duyệt",
  ["User_Nv_HoSoKhongCoQuyenDuyet_004"]: "Hồ sơ không trong có quyền duyệt",
  ["User_Nv_HoSoChuaChonQuyetDinh_005"]: "Hồ sơ chưa chọn quyết định",
  ["User_Nv_HoSoChiDuocCucTruongDuyet_006"]: "Hồ sơ chỉ được cục trưởng duyệt",
  ["Admin_HenNgayNopTrucTiep_000"]:
    "Bạn không có quyền hủy lịch hẹn này. Chỉ người tạo mới có quyền hủy.",
  ["Admin_Huy_Rut_000"]: "Không tìm thấy hồ sơ",
  ["Admin_VanBanQuanTam_001"]: "Đã quan tâm văn bản này",
  ["Admin_VanBanQuanTam_002"]: "Chưa quan tâm văn bản này",
  ["Admin_VanBanQuanTam_003"]: "Quy tắc không tồn tại",
  // Bản đồ số
  // Hạ tầng nội khu
  ["DanhMuc_HaTangNoiKhu_000"]: "Mã hạ tầng nội khu đã tồn tại",
  ["DanhMuc_HaTangNoiKhu_001"]: "Tên hạ tầng nội khu đã tồn tại",
  ["DanhMuc_HaTangNoiKhu_002"]: "Tên tiếng Anh hạ tầng nội khu đã tồn tại",
  ["DanhMuc_HaTangNoiKhu_003"]: "Tên tiếng Trung hạ tầng nội khu đã tồn tại",
  ["DanhMuc_HaTangNoiKhu_004"]: "Tên tiếng Nhật hạ tầng nội khu đã tồn tại",
  ["DanhMuc_HaTangNoiKhu_005"]: "Tên tiếng Hàn hạ tầng nội khu đã tồn tại",
  ["DanhMuc_HaTangNoiKhu_006"]:
    "Không thể xóa hạ tầng nội khu đang được sử dụng",
  ["DanhMuc_HaTangNoiKhu_007"]: "Mã không được vượt quá 50 ký tự",
  ["DanhMuc_HaTangNoiKhu_008"]: "Tên hạ tầng không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangNoiKhu_009"]:
    "Mã không được chứa khoảng trắng hoặc ký tự tiếng Việt có dấu",
  ["DanhMuc_HaTangNoiKhu_010"]: "Tên tiếng Anh không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangNoiKhu_011"]: "Tên tiếng Trung không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangNoiKhu_012"]: "Tên tiếng Nhật không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangNoiKhu_013"]: "Tên tiếng Hàn không được vượt quá 255 ký tự",
  // Hạ tầng kết nối
  ["DanhMuc_HaTangKetNoi_000"]: "Mã hạ tầng kết nối đã tồn tại",
  ["DanhMuc_HaTangKetNoi_001"]: "Tên hạ tầng kết nối đã tồn tại",
  ["DanhMuc_HaTangKetNoi_002"]: "Tên tiếng Anh hạ tầng kết nối đã tồn tại",
  ["DanhMuc_HaTangKetNoi_003"]: "Tên tiếng Trung hạ tầng kết nối đã tồn tại",
  ["DanhMuc_HaTangKetNoi_004"]: "Tên tiếng Nhật hạ tầng kết nối đã tồn tại",
  ["DanhMuc_HaTangKetNoi_005"]: "Tên tiếng Hàn hạ tầng kết nối đã tồn tại",
  ["DanhMuc_HaTangKetNoi_006"]:
    "Không thể xóa hạ tầng kết nối đang được sử dụng",
  ["DanhMuc_HaTangKetNoi_007"]: "Mã không được vượt quá 50 ký tự",
  ["DanhMuc_HaTangKetNoi_008"]: "Tên hạ tầng không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangKetNoi_009"]:
    "Mã không được chứa khoảng trắng hoặc ký tự tiếng Việt có dấu",
  ["DanhMuc_HaTangKetNoi_010"]: "Tên tiếng Anh không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangKetNoi_011"]: "Tên tiếng Trung không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangKetNoi_012"]: "Tên tiếng Nhật không được vượt quá 255 ký tự",
  ["DanhMuc_HaTangKetNoi_013"]: "Tên tiếng Hàn không được vượt quá 255 ký tự",
  // Convert Shapefile
  ["BDS_Convert_001"]: "File không được để trống",
  ["BDS_Convert_002"]: "File phải là định dạng ZIP",
  ["BDS_Convert_003"]: "File vượt quá 2MB",
  ["BDS_Convert_004"]: "File ZIP không hợp lệ hoặc bị hỏng",
  ["BDS_Convert_005"]: "ZIP thiếu file .shp",
  ["BDS_Convert_006"]: "ZIP thiếu file .dbf",
  ["BDS_Convert_007"]: "ZIP thiếu file .shx",
  ["BDS_Convert_008"]: "ZIP chứa nhiều hơn 1 shapefile",
  ["BDS_Convert_009"]: "Không thể đọc shapefile",
  ["BDS_Convert_010"]: "Shapefile không có geometry hợp lệ",
  ["BDS_Convert_011"]: "Geometry phải là Polygon hoặc MultiPolygon",

  // Bản đồ nền
  ["BDS_BanDoNen_001"]: "Tên bản đồ nền đã tồn tại",
  ["BDS_BanDoNen_002"]: "Nhãn không được vượt quá 12 ký tự",
  ["BDS_BanDoNen_003"]: "Đường dẫn mẫu bản đồ không hợp lệ.",
  ["BDS_BanDoNen_004"]: "Đường dẫn hình ảnh không hợp lệ",
  ["BDS_BanDoNen_005"]: "Mô tả không được vượt quá 1000 ký tự",
  ["BDS_BanDoNen_006"]: "Đường dẫn template không được vượt quá 1000 ký tự",
  ["BDS_BanDoNen_007"]: "Đường dẫn hình ảnh không được vượt quá 500 ký tự",
  // Tile
  ["BDS_Tile_001"]: "Bộ tọa độ tile không hợp lệ",
  // Geometry
  ["BDS_Geometry_001"]: "Thiếu dữ liệu hình học",
  ["BDS_Geometry_002"]: "Sai kiểu dữ liệu hình học mong muốn",
  ["BDS_Geometry_003"]: "Dữ liệu hình học rỗng",
  ["BDS_Geometry_004"]: "Dữ liệu hình học không đúng cấu trúc",
  ["BDS_Geometry_005"]:
    "Dữ liệu hình học vượt phạm vi hệ quy chiếu tọa độ tiêu chuẩn toàn cầu (WGS84)",
  ["BDS_Geometry_006"]:
    "Mã định danh tham chiếu Không gian (SRID) không hợp lệ",
  // KCNKKT
  ["BDS_KCNKKT_001"]: "Khu công nghiệp/khu kinh tế đã tồn tại",
  ["BDS_Mau_001"]: "Màu sắc không hợp lệ, phải theo định dạng #RGB, #RGBA, #RRGGBB hoặc #RRGGBBAA",
  // Hạ tầng nội khu và phân khu chức năng
  ["BDS_HTNKPKCN_001"]: "Thiếu tọa độ geometry",
  ["BDS_HTNKPKCN_002"]: "Kiểu geometry không khớp với loại hình học đã chọn",
  ["BDS_HTNKPKCN_003"]: "URL đối tượng 3D không hợp lệ",
  ["BDS_HTNKPKCN_004"]: "Loại hạ tầng nội khu không tồn tại trong danh mục",
  ["BDS_HTNKPKCN_005"]: "Tên không được vượt quá 500 ký tự",
  ["BDS_HTNKPKCN_006"]: "Mô tả không được vượt quá 2000 ký tự",
  ["BDS_HTNKPKCN_007"]: "Đường dẫn đối tượng 3D không được vượt quá 1000 ký tự",
  ["BDS_HTNKPKCN_008"]: "KCN/KKT không tồn tại",
  ["BDS_HTNKPKCN_009"]: "Lớp không tồn tại hoặc không hoạt động",
  ["BDS_HTNKPKCN_010"]: "Lớp không thuộc nhóm hạ tầng nội khu",
  ["BDS_HTNKPKCN_012"]: "Loại hình học không khớp với loại hình học của lớp",
  // Hạ tầng kết nối đầu tư
  ["BDS_HaTangKetNoiDT_001"]: "Thiếu tọa độ điểm (geometry)",
  ["BDS_HaTangKetNoiDT_002"]: "Geometry phải là kiểu Point",
  ["BDS_HaTangKetNoiDT_003"]: "URL đối tượng 3D không hợp lệ",
  ["BDS_HaTangKetNoiDT_004"]:
    "Loại hạ tầng kết nối không tồn tại trong danh mục",
  ["BDS_HaTangKetNoiDT_005"]: "Tên không được vượt quá 500 ký tự",
  ["BDS_HaTangKetNoiDT_006"]: "Mô tả không được vượt quá 2000 ký tự",
  ["BDS_HaTangKetNoiDT_007"]:
    "Đường dẫn đối tượng 3D không được vượt quá 1000 ký tự",
  ["BDS_HaTangKetNoiDT_008"]: "Lớp không tồn tại hoặc không hoạt động",
  ["BDS_HaTangKetNoiDT_009"]: "Lớp không thuộc nhóm hạ tầng kết nối",
  // Cấu hình zoom lớp bản đồ
  ["BDS_CauHinhZoom_001"]: "Mức zoom không được âm",
  ["BDS_CauHinhZoom_002"]:
    "Mức zoom tối thiểu phải nhỏ hơn hoặc bằng mức zoom tối đa",
  ["BDS_CauHinhZoom_003"]: "Mức zoom tối đa vượt quá giới hạn hệ thống hỗ trợ",
  ["BDS_CauHinhZoom_004"]:
    "Khoảng zoom bị chồng lấn với cấu hình khác trong cùng nhóm",
  // Cấu hình hiển thị
  ["BDS_CauHinhHienThi_001"]: "Loại biểu tượng không hợp lệ",
  ["BDS_CauHinhHienThi_002"]: "Thiếu tham số cấu hình cho biểu tượng",
  ["BDS_CauHinhHienThi_003"]: "Thiếu tham số cấu hình cho biểu tượng dựng sẵn",
  ["BDS_CauHinhHienThi_004"]:
    "Thiếu tham số cấu hình cho biểu tượng lựa chọn từ danh sách",
  ["BDS_CauHinhHienThi_005"]: "Tệp tin biểu tượng không tồn tại",
  ["BDS_Lop_006"]: "Không thể xóa lớp đang được sử dụng bởi dữ liệu hạ tầng kết nối/nội khu",
  ["BDS_Lop_007"]: "Không thể đổi loại hình học/nhóm hạ tầng khi lớp đang có hạ tầng sử dụng",
  // Lớp bản đồ
  ["BDS_Lop_001"]: "Tên không được vượt quá 255 ký tự",
  ["BDS_Lop_002"]: "Loại hình học không hợp lệ (1=Điểm, 2=Đường, 3=Vùng)",
  ["BDS_Lop_003"]: "Nhóm hạ tầng không hợp lệ (1=Kết nối, 2=Nội khu)",
  ["BDS_Lop_004"]: "Lớp thuộc nhóm hạ tầng kết nối chỉ được là loại hình học Điểm",
  ["BDS_Lop_005"]: "Không thể xóa lớp đang có cấu hình hiển thị",
  // Cấu hình hiển thị lớp
  ["BDS_CauHinhHienThiLop_001"]: "Lớp không tồn tại",
  ["BDS_CauHinhHienThiLop_002"]: "Danh mục hạ tầng không tồn tại hoặc không hoạt động",
  ["BDS_CauHinhHienThiLop_003"]: "Danh mục không thuộc nhóm hạ tầng của lớp",
  ["BDS_CauHinhHienThiLop_004"]: "Danh mục đã được cấu hình cho lớp này",
  ["BDS_CauHinhHienThiLop_007"]: "Độ rộng nét vẽ phải lớn hơn 0",

  // dm_NgheNghiep
  ["dm_NgheNghiep_008"]: "Ngày hiệu lực không hợp lệ",
  ["dm_NgheNghiep_009"]:
    "Đã tồn tại phiên bản có ngày hiệu lực trùng với ngày hiệu lực của phiên bản này",
  ["dm_NgheNghiep_010"]: "Phiên bản gốc không tồn tại",
  ["dm_NgheNghiep_011"]: "Đây không phải phiên bản hẹn lịch nên không thể xóa",
  // ["Admin_QuocGia_012"]: "Mã Quốc gia đã tồn tại!",

  //Quản lý tệp tin
  ["QuanLyTepTin_Upload_001"]: "Loại tệp không tồn tại hoặc không hoạt động",
  ["QuanLyTepTin_Upload_002"]: "Đuôi tệp không được phép tải lên cho loại này",
  ["QuanLyTepTin_Upload_003"]: "Tệp vượt quá giới hạn dung lượng cho phép",
  ["QuanLyTepTin_Upload_004"]: "Chưa chọn tệp để tải lên",
  ["QuanLyTepTin_Upload_005"]: "Không thể xóa tệp, hủy xóa dữ liệu",
};

export const useServerErrorMsg = () => {
  return { ERROR_CODE_MSG };
};
export default useServerErrorMsg;
