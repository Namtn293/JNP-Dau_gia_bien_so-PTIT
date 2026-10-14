export const vi_auth = {
  header: {
    title: "Sàn Đấu Giá Biển Số Xe",
    subtitle: "Hệ thống Đấu giá Trực tuyến Quốc gia",
  },
  footer: {
    note: "Nhanh chóng, minh bạch và an toàn — Hệ thống đấu giá biển số xe trực tuyến.",
  },
  selection: {
    back_home: "Quay về trang chủ",
    title: "Chọn phương thức đăng nhập",
    subtitle: "Vui lòng chọn hình thức phù hợp để tiếp tục sử dụng hệ thống.",

    admin: {
      label: "Dành cho cán bộ",
      title: "Đăng nhập quản trị",
      description:
        "Truy cập vào khu vực quản trị nội bộ bằng tài khoản được cấp. Nếu quên mật khẩu, vui lòng sử dụng chức năng quên mật khẩu.",
      highlight: {
        "1": "Đăng nhập bằng tài khoản cán bộ được cấp để truy cập khu vực quản trị.",
        "2": "Quên mật khẩu? Sử dụng tính năng Quên mật khẩu hoặc xác thực lại theo quy trình.",
        "3": "Cần hỗ trợ thêm, vui lòng liên hệ bộ phận quản trị hệ thống để được cấp lại quyền.",
      },
      login: "Đăng nhập cán bộ",
      forgot: "Quên mật khẩu",
    },

    investor: {
      label: "Dành cho Nhà đầu tư",
      title: "Đăng nhập",
      description: "Truy cập hệ thống bằng tài khoản nhà đầu tư đã đăng ký.",
      highlight: {
        "1": "Đăng nhập bằng tài khoản nhà đầu tư để sử dụng các dịch vụ.",
        "2": "Quên mật khẩu? Thực hiện khôi phục theo hướng dẫn.",
        "3": "Liên hệ bộ phận hỗ trợ nếu cần thêm thông tin.",
      },
      login: "Đăng nhập",
      forgot: "Quên mật khẩu",
    },

    vneid: {
      label: "Dành cho cá nhân / tổ chức",
      title: "Đăng nhập với VNeID",
      description:
        "Sử dụng tài khoản định danh VNeID để truy cập các dịch vụ công trực tuyến nhanh chóng và an toàn.",
      hint: "Tính năng đăng nhập VNeID sẽ mở cổng xác thực riêng biệt khi được kích hoạt.",
    },
  },
  nhadautu_forgotPassword: {
    header: {
      notice: "Sàn Đấu Giá Biển Số Xe hỗ trợ khôi phục",
      title: "Quên mật khẩu?",
      description:
        "Vui lòng nhập CCCD bạn đã đăng ký. Chúng tôi sẽ gửi đường dẫn khởi tạo mật khẩu mới vào email của bạn.",
    },
    form: {
      cccd: {
        label: "CCCD",
        placeholder: "Nhập CCCD",
        required: "Vui lòng nhập CCCD!",
        maxLength: "CCCD không quá 12 ký tự!",
      },
    },
    action: {
      submit: "Gửi email",
      submitting: "Đang gửi",
      backToLogin: "Quay lại đăng nhập",
    },
  },
  forgotPassword: {
    header: {
      notice: "Sàn Đấu Giá Biển Số Xe hỗ trợ khôi phục",
      title: "Quên mật khẩu?",
      description:
        "Vui lòng nhập email bạn đã đăng ký. Chúng tôi sẽ gửi đường dẫn khởi tạo mật khẩu vào email của bạn.",
    },
    form: {
      username: {
        label: "Tên đăng nhập",
      },
      email: {
        label: "Email",
      },
    },
    action: {
      submit: "Gửi email",
      submitting: "Đang gửi",
      backToLogin: "Quay lại đăng nhập",
    },
  },
  investor_login: {
    require_auth: "Sàn Đấu Giá Biển Số Xe yêu cầu bạn xác thực",
    title: "Đăng nhập Đấu giá viên",
    subtitle:
      "Nhập số CMND/CCCD/Hộ chiếu và mật khẩu để truy cập tài khoản đấu giá của bạn.",

    account: {
      label: "Số CMND/CCCD/Hộ chiếu",
      placeholder: "Nhập số CMND/CCCD/Hộ chiếu",
    },

    password: {
      label: "Mật khẩu",
    },

    submit: "Đăng nhập",
    forgot: "Quên mật khẩu?",
  },
  verify: {
    loading: "Đang kiểm tra...",
    success: {
      title: "Tài khoản đã được xác thực!",
      action: "Đăng nhập",
    },
    already: {
      title: "Tài khoản đã được xác thực từ trước",
      subtitle: "Bạn có thể đăng nhập ngay mà không cần xác thực lại.",
      action: "Đăng nhập ngay",
    },
    error: {
      title: "Xác thực không thành công",
      subtitle: "Mã xác thực không hợp lệ hoặc đã hết hạn.",
      action: "Quay lại trang chủ",
    },
  },
  reset: {
    header: "Sàn Đấu Giá Biển Số Xe yêu cầu bạn xác thực",
    title: "Đặt lại mật khẩu",
    description: "Nhập mật khẩu mới để tiếp tục sử dụng hệ thống.",
    form: {
      newPassword: {
        label: "Mật khẩu mới",
        placeholder: "Nhập mật khẩu mới",
        required: "Vui lòng nhập mật khẩu mới!",
      },
    },
    action: {
      submit: "Đặt lại mật khẩu",
      backToLogin: "Quay lại đăng nhập",
    },
  },
  mobile_block: {
    title: "Yêu cầu truy cập máy tính",
    message_1: "Sàn Đấu Giá Biển Số Xe khuyến nghị sử dụng màn hình rộng để có trải nghiệm tốt nhất.",
    message_2: "Vui lòng sử dụng máy tính với độ phân giải màn hình phù hợp để có trải nghiệm đấu giá tốt nhất.",
  },
  form: {
    captcha: {
      label: "Xác thực bảo mật",
      loading: "Đang tải xác thực bảo mật...",
      ready: "Xác thực bảo mật đã sẵn sàng",
      v3Description: "Trang này được bảo vệ bởi Google reCAPTCHA.",
      policyPrefix: "Điều khoản",
      privacyPolicy: "Chính sách bảo mật",
      termsOfService: "Điều khoản dịch vụ",
      policySuffix: "của Google được áp dụng.",
      loadFailed: "Không thể tải xác thực bảo mật. Vui lòng kiểm tra kết nối mạng và thử lại.",
      missingSiteKey: "Chưa cấu hình Site Key reCAPTCHA",
    },
  },
};
export default vi_auth;
