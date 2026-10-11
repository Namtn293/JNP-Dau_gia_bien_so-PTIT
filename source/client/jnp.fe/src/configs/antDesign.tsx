import { Empty, notification } from "antd";
import locale from "antd/es/locale/vi_VN";
import type { ConfigProviderProps } from "antd/lib/config-provider";

// Mapping màu từ design (Primary: #9ccade từ Image 2)
export const colors = {
  primary: "#256b8c", // Primary action color for contrast (deep cyan-blue)
  primaryLight: "#9ccade", // Exact primary color from Image 2
  primarySub: "#194e66",
  primaryGold: "#f2a60d",
  primaryText: "#ffffff", // Màu chữ trên nền tối (VD: Button Primary)
  primaryTitle: "#14202b", // Màu chữ chính
  sectionTitle: "#256b8c", // Màu tiêu đề section/heading
  primarySubtitle: "#586979", // Màu chữ phụ
  primaryBorder: "rgba(156, 202, 222, 0.4)", // Border theo màu #9ccade
  primaryBg: "#f4f8fa", // Nền chính
  primaryBgSub: "#eef6fa", // Nền phụ
  bgHover: "#e2f0f7", // Màu nền khi hover
  bgHighlight: "#9ccade",
  disabled: "#f5f5f5", // Nền disabled
  textDisabled: "rgba(0, 0, 0, 0.45)",
  white: "#ffffff",
};

const antdDefaultConfig: ConfigProviderProps = {
  locale: locale,
  componentSize: "large",
  form: { colon: false },
  space: { size: 12 },
  renderEmpty: () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="Không có dữ liệu"
    />
  ),
  theme: {
    token: {
      fontSize: 14, // Giảm xuống 14px chuẩn UI hiện đại (16px hơi to thô), nếu cần to dùng fontSizeLG
      fontSizeLG: 16,
      fontFamily: "Roboto, sans-serif",
      screenXXL: 1600,
      screenXXLMin: 1600,

      // Màu chủ đạo
      colorPrimary: colors.primary,
      colorInfo: colors.primary,
      colorLink: colors.primary,

      // Màu nền và viền
      colorBgBase: colors.white,
      colorBorder: colors.primaryBorder,
      colorText: colors.primaryTitle,
      colorTextSecondary: colors.primarySubtitle,
      colorTextPlaceholder: "rgba(0, 0, 0, 0.35)", // Placeholder rõ hơn chút

      // Disabled
      colorBgContainerDisabled: colors.disabled,
      colorTextDisabled: colors.textDisabled,

      borderRadius: 6, // Tăng nhẹ bo góc cho mềm mại (4px hơi cứng)
      controlHeight: 40, // Đảm bảo size large đồng bộ
    },
    components: {
      Input: {
        activeBorderColor: colors.primary,
        hoverBorderColor: colors.primarySub,
        colorBgContainerDisabled: colors.disabled,
        colorTextDisabled: colors.textDisabled,
        controlOutline: "rgba(122, 31, 54, 0.1)", // Hiệu ứng glow đỏ nhẹ khi focus thay vì xanh mặc định
      },
      InputNumber: {
        activeBorderColor: colors.primary,
        hoverBorderColor: colors.primarySub,
        controlOutline: "rgba(122, 31, 54, 0.1)",
      },
      Select: {
        colorPrimary: colors.primary,
        optionSelectedColor: colors.primary,
        optionSelectedBg: colors.bgHover, // Nền item đã chọn
        controlOutline: "rgba(122, 31, 54, 0.1)",
      },
      DatePicker: {
        colorPrimary: colors.primary,
        cellActiveWithRangeBg: colors.bgHover,
        cellHoverWithRangeBg: colors.bgHover,
      },
      Table: {
        headerBg: colors.primaryBgSub, // Dùng màu hồng phấn nhạt thay vì xám chết -> Tone-sur-tone
        headerColor: colors.primaryTitle,
        headerBorderRadius: 6,
        borderColor: colors.primaryBorder,
        rowHoverBg: colors.primaryBg,
        rowExpandedBg: colors.primaryBg,
      },
      Badge: {
        colorError: colors.primary,
        colorPrimary: colors.primary,
      },
      Tooltip: {
        colorBgSpotlight: colors.primarySub, // Tooltip đậm hơn chút cho dễ đọc
      },
      Collapse: {
        headerBg: colors.primaryBgSub, // Header collapse đồng bộ với table
        contentBg: colors.white,
        borderRadiusLG: 6,
      },
      Button: {
        // Primary Button
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primarySub,
        colorPrimaryActive: colors.primarySub,
        primaryShadow: "0 2px 0 rgba(122, 31, 54, 0.1)", // Shadow đỏ nhẹ

        // Default Button
        defaultColor: colors.primaryTitle,
        defaultBorderColor: colors.primaryBorder,
        defaultHoverBorderColor: colors.primary,
        defaultHoverColor: colors.primary,
      },
      Checkbox: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primary,
      },
      Radio: {
        colorPrimary: colors.primary,
        buttonSolidCheckedBg: colors.primary,
      },
      Tabs: {
        itemColor: colors.primarySubtitle,
        itemSelectedColor: colors.primary,
        itemHoverColor: colors.primarySub,
        inkBarColor: colors.primary,
      },
      Pagination: {
        itemActiveBg: colors.white,
        colorPrimary: colors.primary,
      },
      Modal: {
        titleFontSize: 18,
        headerBg: colors.white,
      },
    },
  },
};

notification.config({
  maxCount: 9,
  placement: "topRight",
});

export default antdDefaultConfig;
