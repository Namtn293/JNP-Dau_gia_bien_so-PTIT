import { Avatar, Card, FullName, HeaderBanner, HeaderContent, InfoGrid, InfoItem, Label, NameSection, Position, RoleTag, SectionTitle, StatusBadge, TagContainer, Value } from "@/apps/admin/components/header/user-profile/styled";
import type { Taikhoan } from "@/apps/admin/services";

const formatDate = (isoString: string) => {
  if (!isoString) return 'Chưa cập nhật';
  return new Date(isoString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getInitials = (name: string) => {
  return name.split(' ').pop()?.charAt(0).toUpperCase() || 'U';
};

// --- MAIN COMPONENT ---

interface Props {
  data: Taikhoan;
}

const UserProfile: React.FC<Props> = ({ data }) => {
  const info = data.thongTinTaiKhoan;

  return (
    <Card>
      <HeaderBanner />
      <HeaderContent>
        {/* Avatar tĩnh - hiển thị chữ cái đầu của tên */}
        <Avatar>{getInitials(info.hoTen)}</Avatar>

        <NameSection>
          <FullName>
            {info.hoTen}
            <StatusBadge isActive={data.trangThai}>
              {data.trangThai ? 'Đang hoạt động' : 'Đã khóa'}
            </StatusBadge>
          </FullName>
          <Position>{info.tenChucVu} - {info.tenDonVi}</Position>
        </NameSection>
      </HeaderContent>
      <SectionTitle>Thông tin cá nhân</SectionTitle>
      <InfoGrid>
        <InfoItem>
          <Label>Đơn vị công tác</Label>
          <Value>{info.tenDonVi}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Chức vụ hiện tại</Label>
          <Value>{info.tenChucVu}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Email</Label>
          <Value>{info.email}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Số điện thoại</Label>
          <Value>{info.soDienThoai}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Ngày sinh</Label>
          <Value>{formatDate(info.ngaySinh)}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Giới tính</Label>
          <Value>{info.gioiTinh}</Value>
        </InfoItem>
        <InfoItem>
          <Label>CCCD/CMND</Label>
          <Value>{info.canCuocCongDan}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Địa chỉ</Label>
          <Value>{info.diaChi || 'Chưa cập nhật'}</Value>
        </InfoItem>
      </InfoGrid>
      <SectionTitle>Thông tin tài khoản</SectionTitle>
      <InfoGrid>

        <InfoItem>
          <Label>Vai trò hệ thống</Label>
          <TagContainer>
            {data.roles.map((role, index) => (
              <RoleTag key={index}>{role}</RoleTag>
            ))}
          </TagContainer>
        </InfoItem>
        <InfoItem>
          <Label>Tên đăng nhập</Label>
          <Value>{data.tenDangNhap}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Ngày tạo</Label>
          <Value>{formatDate(data.ngayTao)}</Value>
        </InfoItem>
      </InfoGrid>


    </Card>
  );
};

export default UserProfile;