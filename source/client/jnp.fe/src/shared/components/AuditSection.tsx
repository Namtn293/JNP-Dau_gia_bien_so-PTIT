import { useUserNameById } from "@/shared/hooks/useUserNameById";
import dayjs from "dayjs";
import React from "react";
import { useUserInfo } from "~/apps/admin/services";

export interface IAuditInfo {
  ngayTao?: string;
  tenNguoiTao?: string;
  idNguoiTao?: number | string;
  ngaySua?: string;
  tenNguoiSua?: string;
  idNguoiSua?: number | string;
}

interface AuditSectionProps {
  data?: IAuditInfo;
  style?: React.CSSProperties;
}

/** Format ngày tháng hiển thị */
const formatDate = (date?: string) => {
  if (!date) return "—";
  // Nếu date đã có 'Z' (ví dụ new Date().toISOString()), dayjs sẽ tự parse đúng giờ địa phương
  if (date.endsWith("Z")) {
    return dayjs(date).format("HH:mm:ss DD/MM/YYYY");
  }
  // API trả về giờ UTC nhưng không có 'Z', ta cộng thêm 7 tiếng thành giờ VN
  return dayjs(date).add(7, "hour").format("HH:mm:ss DD/MM/YYYY");
};

const AuditSection: React.FC<AuditSectionProps> = ({ data, style }) => {
  const { data: userInfoRes } = useUserInfo();
  const currentUser = userInfoRes?.data?.thongTinTaiKhoan?.hoTen || "Admin";

  const { getUserName } = useUserNameById();

  const isCreate = !data || !data.ngayTao;

  const displayNgayTao = isCreate ? new Date().toISOString() : data?.ngayTao;

  const resolvedTenNguoiTao = (() => {
    const ten = data?.tenNguoiTao;
    if (ten && isNaN(Number(ten))) return ten;
    if (data?.idNguoiTao) return getUserName(data.idNguoiTao);
    return undefined;
  })();

  const resolvedTenNguoiSua = (() => {
    const ten = data?.tenNguoiSua;
    if (ten && isNaN(Number(ten))) return ten;
    if (data?.idNguoiSua) return getUserName(data.idNguoiSua);
    return undefined;
  })();

  const displayTenNguoiTao = isCreate ? currentUser : (resolvedTenNguoiTao || "—");

  const hasUpdate = !!data?.ngaySua;

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 16,
    fontSize: 14,
    ...style,
  };

  const cellWidth = hasUpdate ? "25%" : "50%";

  const thStyle: React.CSSProperties = {
    width: cellWidth,
    padding: "4px 12px",
    fontWeight: 600,
    textAlign: "left",
    color: "#595959",
  };

  const tdStyle: React.CSSProperties = {
    width: cellWidth,
    padding: "4px 12px",
    textAlign: "left",
  };

  return (
    <table style={tableStyle}>
      <tbody>
        {/* Dòng label */}
        <tr>
          <td style={{ ...thStyle, paddingLeft: 0 }}>Ngày tạo</td>
          <td style={hasUpdate ? thStyle : { ...thStyle, paddingRight: 0 }}>Người tạo</td>
          {hasUpdate && <td style={thStyle}>Ngày cập nhật</td>}
          {hasUpdate && <td style={{ ...thStyle, paddingRight: 0 }}>Người cập nhật</td>}
        </tr>
        {/* Dòng giá trị */}
        <tr>
          <td style={{ ...tdStyle, paddingLeft: 0 }}>{formatDate(displayNgayTao)}</td>
          <td style={hasUpdate ? tdStyle : { ...tdStyle, paddingRight: 0 }}>{displayTenNguoiTao}</td>
          {hasUpdate && <td style={tdStyle}>{formatDate(data?.ngaySua)}</td>}
          {hasUpdate && <td style={{ ...tdStyle, paddingRight: 0 }}>{resolvedTenNguoiSua || "—"}</td>}
        </tr>
      </tbody>
    </table>
  );
};

export default AuditSection;
