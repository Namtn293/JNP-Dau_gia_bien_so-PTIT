export const formatText = (status: unknown): string => {
  if (status === null || status === undefined) return "";

  // boolean (hay gặp nhất)
  if (typeof status === "boolean") {
    return status ? "Hoạt động" : "Không hoạt động";
  }

  // number
  if (typeof status === "number") {
    return status.toString();
  }

  // đảm bảo là string
  const value = String(status);

  const capMatch = value.match(/^Cap_(\d)$/);
  if (capMatch) {
    return `Cấp ${capMatch[1]}`;
  }

  switch (value) {
    case "DangTiepNhan":
      return "Đang tiếp nhận";
    case "DaTiepNhan":
      return "Đã tiếp nhận";
    case "TuChoi":
      return "Từ chối";
    case "ChoTiepNhan":
      return "Chờ tiếp nhận";
    case "HoanThanh":
      return "Hoàn thành";
    case "DangXuLy":
      return "Đang xử lý";
    case "TrucTiep":
      return "Trực tiếp";
    case "TrucTuyen":
      return "Trực tuyến"
    case "QuaBuuDien":
      return "Qua Bưu Điện"
    case "QuyDinh":
      return "Quy định";
    case "Khac":
      return "Khác";
    case "YCBS_SauTiepNhan":
      return "Cán bộ xử lý yêu cầu bổ sung"
    case "YCBS_TruocTiepNhan":
      return "Cán bộ tiếp nhận yêu cầu bổ sung"
    case "Cho_TNBS_Chua_Chuyen_Xu_Ly":
      return "Chờ tiếp nhận bổ sung"
    case "Cho_TNBS_Da_Chuyen_Xu_Ly":
      return "Chờ tiếp nhận bổ sung"
    case "HSDangXuLy":
      return "Đang xử lý";
    case "HSDangPheDuyet":
      return "Đang phê duyệt";
    case "HSChoDonViChuyenMonThuLy":
      return "Chờ đơn vị chuyên môn thụ lý";
    case "HSLuuTam":
      return "Lưu nháp";

    case "HSTraLai":
      return "Hồ sơ trả lại";

    case "HSDaTraKetQua":
      return "Đã trả kết quả";

    case "HSChoTraKetQuaKhongDuDieuKien":
      return "Chờ trả kết quả";

    case "HSChoXacNhanHuyRut":
      return "Chờ xác nhận hủy/rút";

    case "HSTrucTuyenChoTiepNhan":
      return "Trực tuyến chờ tiếp nhận";

    case "HSDaDungXuLy":
      return "Đã dừng xử lý";

    case "HSKhongDuDieuKien":
      return "Không đủ điều kiện";
    case "HSDaHuyRut":
      return "Đã hủy/rút";
    case "HSChoHenNopTrucTiep":
      return "Chờ hẹn nộp trực tiếp";
    case "HSDaHenNopTrucTiep":
      return "Đã hẹn nộp trực tiếp";
    case "HSChoBanGiaoTuCanBo":
      return "Chờ bàn giao hồ sơ rút";
    case "HSDangLayYKien":
      return "Đang lấy ý kiến";
    case "HSDaTuChoiTiepNhan":
      return "Đã từ chối tiếp nhận";
    case "HSChoTraKetQua":
      return "Chờ trả kết quả";
    case "HSDaPheDuyet":
      return "Đã phê duyệt";
    case "DaTraHSRut":
      return "Đã trả hồ sơ rút";
    case "CaNhan":
      return "Cá nhân";
    case "ToChuc":
      return "Tổ chức";


    case "QT_CapBo":
      return "Quy trình cấp Bộ";
    case "QT_CapCuc":
      return "Quy trình cấp Cục"

    case "QT_CapCuc_TrinhBo":
      return "Quy trình Cục trình Bộ";

    case "QT_CapSo":
      return "Quy trình cấp Sở"

    case "QT_CapSo_TrinhUBND":
      return "Quy trình Sở trình UBND";

    case "QT_CapUBND":
      return "Quy trình cấp UBND";

    case "QT_CapBQL":
      return "Quy trình cấp ban quản lý";

    case "QT_CapBQL_TrinhUBND":
      return "Quy trình ban quản lý trình UBND";

    case "QT_CapUBND_BQLTrinh":
      return "Quy trình UBND ban quản lý trình"


    case "DaGui":
      return "Đã gửi yêu cầu bổ sung";
    case "DaBoSung":
      return "Đã bổ sung";
    case "ThongBao":
      return "Thông báo";
    case "YeuCauGiaHan":
      return "Yêu cầu gia hạn";
    case "HetHan":
      return "Hết hạn";
    // "QT_CapBo = 1,
    // QT_CapCuc = 2,
    // QT_CapSo = 3,
    // QT_CapUBND = 4,
    // QT_CapBQL = 5,
    // QT_CapUBND_BQLTrinh = 6 "

    case "ThoiGian":
      return "Thời gian";
    case "DoDai":
      return "Độ dài";
    case "SoLuong":
      return "Số lượng";
    case "TheTich":
      return "Thể tích";
    case "NhietDo":
      return "Nhiệt độ";
    case "DienTich":
      return "Diện tích";
    case "ApSuat":
      return "Áp suất";
    case "CongSuat":
      return "Công suất";
    case "Dien":
      return "Điện";
    case "NangLuong":
      return "Năng lượng";
    case "TanSo":
      return "Tần số";
    case "DonViDem":
      return "Đơn vị đếm";
    case "ThuBay":
      return "Thứ bảy";
    case "ChuNhat":
      return "Chủ nhật";
    case "NgayThuong":
      return "Ngày thường";

    default:
      return value.replace(/([A-Z])/g, " $1").trim();
  }
};

export const removeVietnameseTones = (str?: string) => {
  if (!str) return "";
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export const filterOptionMatch = (input: string, option?: any) => {
  return removeVietnameseTones((option?.children as unknown as string) || (option?.label as unknown as string) || "")
    .toLowerCase()
    .includes(removeVietnameseTones(input).toLowerCase());
};
