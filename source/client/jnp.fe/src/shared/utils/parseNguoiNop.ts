// helpers/tiepNhanHoSo.helper.ts

export const parseThongTinNguoiNop = (data: any) => {
  if (!data) return null;

  const isToChuc = data.doiTuong === "ToChuc";

  if (isToChuc) {
    return {
      doiTuong: "ToChuc",
      tenToChuc: data.tenToChuc,
      maToChuc: data.matoChuc,
      ngayCap: data.ngayCap,
      noiCap: data.noiCap,
      email: data.emailToChuc,
      soDienThoai: data.soDienThoaiToChuc,
      diaChi: data.diaChiToChuc,
      fax: data.fax,
    };
  }

  return {
    doiTuong: "CaNhan",
    tenNguoiNop: data.tenNguoiNop,
    soCCCD: data.soCCCD,
    soDienThoai: data.soDienThoaiNguoiNop,
    email: data.emailNguoiNop,
    diaChi: data.diaChiNguoiNop,
    laChuSoHuu: data.laChuSoHuu,
  };
};
