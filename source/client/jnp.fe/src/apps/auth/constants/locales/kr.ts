export const kr_auth = {
  header: {
    title: "국가 투자 원스톱 포털",
    subtitle: "하나의 계정으로 다양한 서비스를 이용하세요",
  },
  footer: {
    note: "빠르고 안전하며 신뢰할 수 있는 서비스 — 국가 투자 원스톱 포털 계정으로 모든 서비스를 이용하세요.",
  },
  selection: {
    back_home: "홈으로 돌아가기",
    title: "로그인 방식 선택",
    subtitle: "계속하려면 적절한 방식을 선택해 주세요.",

    admin: {
      label: "공무원용",
      title: "관리자 로그인",
      description: "부여된 계정을 사용하여 내부 관리 시스템에 접근합니다.",
      highlight: {
        "1": "부여된 공무원 계정으로 로그인하여 관리 시스템에 접근합니다.",
        "2": "비밀번호를 잊으셨나요? 비밀번호 재설정 기능을 이용하세요.",
        "3": "추가 지원이 필요하면 시스템 관리자에게 문의하세요.",
      },
      login: "공무원 로그인",
      forgot: "비밀번호 찾기",
    },

    investor: {
      label: "투자자용",
      title: "로그인",
      description: "등록된 투자자 계정을 사용하여 시스템에 접속합니다.",
      highlight: {
        "1": "투자자 계정으로 로그인하여 서비스를 이용합니다。",
        "2": "비밀번호를 잊으셨나요? 안내에 따라 복구하세요.",
        "3": "추가 도움이 필요하면 지원 부서에 문의하세요.",
      },
      login: "로그인",
      forgot: "비밀번호 찾기",
    },

    vneid: {
      label: "개인 / 기관용",
      title: "VNeID로 로그인",
      description:
        "VNeID 디지털 신원을 사용하여 안전하고 빠르게 온라인 공공 서비스를 이용할 수 있습니다.",
      hint: "VNeID 로그인 기능은 인증 게이트웨이가 활성화되면 제공됩니다.",
    },
  },
  nhadautu_forgotPassword: {
    header: {
      notice: "국가 투자 원스톱 포털은 계정 복구를 지원합니다",
      title: "비밀번호를 잊으셨나요?",
      description:
        "등록한 신분증 번호를 입력하세요. 비밀번호 재설정 링크가 이메일로 전송됩니다.",
    },
    form: {
      cccd: {
        label: "신분증 번호",
        placeholder: "신분증 번호 입력",
        required: "신분증 번호를 입력해 주세요!",
        maxLength: "신분증 번호는 12자를 초과할 수 없습니다!",
      },
    },
    action: {
      submit: "이메일 보내기",
      submitting: "전송 중",
      backToLogin: "로그인으로 돌아가기",
    },
  },
  forgotPassword: {
    header: {
      notice: "국가 투자 원스톱 포털 복구 지원",
      title: "비밀번호를 잊으셨나요?",
      description:
        "등록하신 이메일을 입력해 주세요. 비밀번호 재설정 링크를 이메일로 보내드립니다.",
    },
    form: {
      username: {
        label: "아이디",
      },
      email: {
        label: "이메일",
      },
    },
    action: {
      submit: "이메일 보내기",
      submitting: "전송 중",
      backToLogin: "로그인으로 돌아가기",
    },
  },
  investor_login: {
    require_auth: "국가 투자 포털에서 인증이 필요합니다",
    title: "투자자 로그인",
    subtitle:
      "신분증 또는 여권 번호와 비밀번호를 입력하여 투자자 전용 영역에 접속하세요.",

    account: {
      label: "신분증 / 여권 번호",
      placeholder: "신분증 또는 여권 번호 입력",
    },

    password: {
      label: "비밀번호",
    },

    submit: "로그인",
    forgot: "비밀번호를 잊으셨나요?",
  },
  verify: {
    loading: "확인 중...",
    success: {
      title: "계정이 성공적으로 인증되었습니다!",
      action: "로그인",
    },
    already: {
      title: "이미 인증된 계정입니다",
      subtitle: "재인증 없이 바로 로그인할 수 있습니다.",
      action: "바로 로그인",
    },
    error: {
      title: "인증 실패",
      subtitle: "인증 코드가 유효하지 않거나 만료되었습니다.",
      action: "홈으로 돌아가기",
    },
  },
  reset: {
    header: "국가 투자 원스톱 포털에서 인증을 요청합니다",
    title: "비밀번호 재설정",
    description: "새 비밀번호를 입력하여 계속 이용하세요.",
    form: {
      newPassword: {
        label: "새 비밀번호",
        placeholder: "새 비밀번호 입력",
        required: "새 비밀번호를 입력해 주세요!",
      },
    },
    action: {
      submit: "비밀번호 재설정",
      backToLogin: "로그인으로 돌아가기",
    },
  },
};
export default kr_auth;
