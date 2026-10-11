//Nhà đầu tư

// Route quản lý danh mục
export const QUAN_LY_DANH_MUC_ROUTE = "/quan-ly-danh-muc";
export const GIAY_TO_TPHS_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/giay-to-TPHS`;
export const CAP_CO_QUAN_QUAN_LY_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/cap-co-quan-quan-ly`;
export const CO_QUAN_QUAN_LY_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/co-quan-quan-ly`;
export const LINH_VUC_AP_DUNG_VOI_TTHC_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/linh-vuc-ap-dung-cho-TTHC`;
export const NHOM_THU_TUC_HANH_CHINH_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/nhom-thu-tuc-hanh-chinh`;

export const THU_TUC_HANH_CHINH_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/thu-tuc-hanh-chinh`;
export const THEM_MOI_THU_TUC_HANH_CHINH_ROUTE = `${THU_TUC_HANH_CHINH_ROUTE}/them-moi-thu-tuc-hanh-chinh`;
export const CAP_NHAT_THU_TUC_HANH_CHINH_ROUTE = `${THU_TUC_HANH_CHINH_ROUTE}/cap-nhat-thu-tuc-hanh-chinh`;

export const QUY_TRINH_XU_LY_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/quy-trinh-xu-ly`;
export const THEM_MOI_QUY_TRINH_XU_LY_ROUTE = `${QUY_TRINH_XU_LY_ROUTE}/them-moi`;
export const CAP_NHAT_QUY_TRINH_XU_LY_ROUTE = `${QUY_TRINH_XU_LY_ROUTE}/cap-nhat`;

export const DICH_VU_CONG_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/dich-vu-cong`;

export const QUAN_LY_LOAI_VAN_BAN_ROUTE = `${QUAN_LY_DANH_MUC_ROUTE}/quan-ly-loai-van-ban`;

// Quản lý bài viết
export const QUAN_LY_BAI_VIET_ROUTE = "/quan-ly-bai-viet";

// Bài viết của tôi
export const BAI_VIET_CUA_TOI_ROUTE = `${QUAN_LY_BAI_VIET_ROUTE}/bai-viet-cua-toi`;
export const TIM_KIEM_BAI_VIET_ROUTE = `${BAI_VIET_CUA_TOI_ROUTE}/tim-kiem-bai-viet`;
export const TO_CHUC_THEO_SU_KIEN_ROUTE = `${BAI_VIET_CUA_TOI_ROUTE}/to-chuc-theo-su-kien`;
export const TO_CHUC_THEO_CHU_DE_ROUTE = `${BAI_VIET_CUA_TOI_ROUTE}/to-chuc-theo-chu-de`;
export const TO_CHUC_THEO_CHUYEN_MUC_ROUTE = `${BAI_VIET_CUA_TOI_ROUTE}/to-chuc-theo-chuyen-muc`;
export const BAI_VIET_SOAN_THAO_ROUTE = `${BAI_VIET_CUA_TOI_ROUTE}/bai-viet-soan-thao`;
export const BAI_VIET_SOAN_THAO_TAO_MOI_ROUTE = `${BAI_VIET_SOAN_THAO_ROUTE}/tao-moi`;
export const BAI_VIET_SOAN_THAO_CHINH_SUA_ROUTE = `${BAI_VIET_SOAN_THAO_ROUTE}/chinh-sua`;

//Công cụ SEO
export const CONG_CU_SEO_ROUTE = `${QUAN_LY_BAI_VIET_ROUTE}/cong-cu-SEO`;
export const SEO_BAI_VIET_ROUTE = `${CONG_CU_SEO_ROUTE}/seo-bai-viet`;
export const SEO_THEO_URL_ROUTE = `${CONG_CU_SEO_ROUTE}/seo-theo-URL`;

// Xuất bản bài viết
export const XUAT_BAN_BAI_VIET_ROUTE = `${QUAN_LY_BAI_VIET_ROUTE}/xuat-ban-bai-viet`;
export const CHO_BIEN_TAP_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/cho-bien-tap`;
export const SO_DUYET_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/so-duyet`;
export const DUYET_NOI_DUNG_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/duyet-noi-dung`;
export const DUYET_XUAT_BAN_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/duyet-xuat-ban`;
export const LICH_XUAT_BAN_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/lich-xuat-ban`;
export const DA_XUAT_BAN_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/da-xuat-ban`;
export const DA_GO_XUONG_ROUTE = `${XUAT_BAN_BAI_VIET_ROUTE}/da-go-xuong`;

// Cấu hình dữ liệu
export const CAU_HINH_DU_LIEU_ROUTE = `${QUAN_LY_BAI_VIET_ROUTE}/cau-hinh-du-lieu`;
export const QUAN_LY_CHUYEN_MUC_ROUTE = `${CAU_HINH_DU_LIEU_ROUTE}/quan-ly-chuyen-muc-bai-viet`;
export const CAU_HINH_BANNER_ROUTE = `${CAU_HINH_DU_LIEU_ROUTE}/cau-hinh-banner`;
export const QUAN_LY_TOPIC_ROUTE = `${CAU_HINH_DU_LIEU_ROUTE}/quan-ly-topic`;
export const QUAN_LY_SU_KIEN_ROUTE = `${CAU_HINH_DU_LIEU_ROUTE}/quan-ly-su-kien`;
export const BIEN_TAP_TRANG_TINH_ROUTE = `${CAU_HINH_DU_LIEU_ROUTE}/bien-tap-trang-tinh`;
export const QUAN_LY_TAG_ROUTE = `${CAU_HINH_DU_LIEU_ROUTE}/quan-ly-tag`;

// Quản lý tài nguyên
export const QUAN_LY_TAI_NGUYEN_ROUTE = `${QUAN_LY_BAI_VIET_ROUTE}/quan-ly-tai-nguyen`;
export const QUAN_LY_HINH_ANH_ROUTE = `${QUAN_LY_TAI_NGUYEN_ROUTE}/quan-ly-anh`;
export const QUAN_LY_FILE_AUDIO_ROUTE = `${QUAN_LY_TAI_NGUYEN_ROUTE}/quan-ly-file-audio`;
export const QUAN_LY_VIDEO_ROUTE = `${QUAN_LY_TAI_NGUYEN_ROUTE}/quan-ly-video`;
export const THU_MUC_CA_NHAN_ROUTE = `${QUAN_LY_TAI_NGUYEN_ROUTE}/thu-muc-ca-nhan`;

//Quản trị tài khoản
export const QUAN_TRI_TAI_KHOAN_ROUTE = "/quan-tri-tai-khoan";

export const QUAN_LY_VAI_TRO_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-vai-tro`;
export const QUAN_LY_DON_VI_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-don-vi`;

export const QUAN_LY_MENU_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-menu`; //Quản lý menu
export const QUAN_LY_NHOM_QUYEN_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-nhom-quyen`; // Quản lý nhóm quyền và quyền
export const QUAN_LY_NGUOI_DUNG_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-nguoi-dung`;
export const QUAN_LY_CA_NHAN_TO_CHUC_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-ca-nhan-to-chuc`;
export const QUAN_LY_TAI_KHOAN_NHAN_VIEN_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-tai-khoan-nhan-vien`;
export const QUAN_LY_UY_QUYEN_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/quan-ly-uy-quyen`;
export const UY_QUYEN_ROUTE = `${QUAN_LY_UY_QUYEN_ROUTE}/uy-quyen`;
export const NHAT_KY_THAO_TAC_ROUTE = `${QUAN_TRI_TAI_KHOAN_ROUTE}/nhat-ky-thao-tac`; // Nhật ký thao tác

// Cấu hình hệ thống
export const CAU_HINH_HE_THONG_ROUTE = "/cau-hinh-he-thong";

export const QUAN_LY_CAU_HINH_ROUTE = `${CAU_HINH_HE_THONG_ROUTE}/quan-ly-cau-hinh`;

// Quản lý kho trí thức
export const KHO_TRI_THUC_ROUTE = `/kho-tri-thuc`;
export const QUAN_LY_KHO_TRI_THUC_ROUTE = `${KHO_TRI_THUC_ROUTE}/quan-ly-tri-thuc`;
export const TAI_LEN_TAI_LIEU_ROUTE = `${QUAN_LY_KHO_TRI_THUC_ROUTE}/tai-len`;
export const QUAN_LY_NGUON_DU_LIEU_ROUTE = `${KHO_TRI_THUC_ROUTE}/quan-ly-nguon-du-lieu`;
export const QUAN_LY_KHO_TRI_THUC_TIN_NHAN_ROUTE = `${KHO_TRI_THUC_ROUTE}/tin-nhan`;
export const QUAN_LY_KHO_TRI_THUC_CHAT_WIDGET_ROUTE = `${KHO_TRI_THUC_ROUTE}/chat-widget`;
export const QUAN_LY_CANH_BAO_ROUTE = `${KHO_TRI_THUC_ROUTE}/quan-ly-canh-bao`;
export const QUAN_LY_NHAN_ROUTE = `${KHO_TRI_THUC_ROUTE}/quan-ly-nhan`;
