export const cn_auth = {
  header: {
    title: "国家投资一站式门户",
    subtitle: "一个账户，多项服务",
  },
  footer: {
    note: "快捷、安全、可靠 — 使用国家投资一站式门户账户畅享所有服务。",
  },
  selection: {
    back_home: "返回首页",
    title: "选择登录方式",
    subtitle: "请选择合适的方式以继续使用系统。",

    admin: {
      label: "适用于工作人员",
      title: "管理登录",
      description:
        "使用分配的账户访问内部管理系统。如忘记密码，请使用找回密码功能。",
      highlight: {
        "1": "使用分配的工作人员账户登录以访问管理系统。",
        "2": "忘记密码？请使用找回密码功能或按流程重新验证。",
        "3": "如需进一步支持，请联系系统管理部门以重新获取权限。",
      },
      login: "工作人员登录",
      forgot: "忘记密码",
    },

    investor: {
      label: "适用于投资者",
      title: "登录",
      description: "使用已注册的投资者账户访问系统。",
      highlight: {
        "1": "使用投资者账户登录以使用相关服务。",
        "2": "忘记密码？请按照指引进行密码恢复。",
        "3": "如需帮助，请联系支持部门。",
      },
      login: "登录",
      forgot: "忘记密码",
    },

    vneid: {
      label: "适用于个人 / 组织",
      title: "使用 VNeID 登录",
      description: "使用 VNeID 数字身份安全、快捷地访问在线公共服务。",
      hint: "VNeID 登录功能将在认证网关启用后开放。",
    },
  },
  nhadautu_forgotPassword: {
    header: {
      notice: "国家投资一站式门户支持账户恢复",
      title: "忘记密码？",
      description:
        "请输入您注册的身份证号码，我们将向您的邮箱发送重置密码链接。",
    },
    form: {
      cccd: {
        label: "身份证号",
        placeholder: "请输入身份证号",
        required: "请输入身份证号！",
        maxLength: "身份证号不能超过12个字符！",
      },
    },
    action: {
      submit: "发送邮件",
      submitting: "正在发送",
      backToLogin: "返回登录",
    },
  },
  forgotPassword: {
    header: {
      notice: "国家投资一站式门户恢复支持",
      title: "忘记密码？",
      description:
        "请输入您注册时使用的电子邮箱，我们将向您发送重置密码的链接。",
    },
    form: {
      username: {
        label: "用户名",
      },
      email: {
        label: "电子邮箱",
      },
    },
    action: {
      submit: "发送邮件",
      submitting: "发送中",
      backToLogin: "返回登录",
    },
  },
  investor_login: {
    require_auth: "国家投资门户需要您进行身份验证",
    title: "投资者登录",
    subtitle: "请输入身份证 / 公民证 / 护照号码和密码以访问您的投资者专区。",

    account: {
      label: "身份证 / 公民证 / 护照号码",
      placeholder: "请输入身份证或护照号码",
    },

    password: {
      label: "密码",
    },

    submit: "登录",
    forgot: "忘记密码？",
  },
  verify: {
    loading: "正在验证...",
    success: {
      title: "账户已成功验证！",
      action: "登录",
    },
    already: {
      title: "账户已验证",
      subtitle: "您可以直接登录，无需再次验证。",
      action: "立即登录",
    },
    error: {
      title: "验证失败",
      subtitle: "验证码无效或已过期。",
      action: "返回首页",
    },
  },
  reset: {
    header: "国家投资一站式门户需要验证",
    title: "重置密码",
    description: "请输入新密码以继续使用系统。",
    form: {
      newPassword: {
        label: "新密码",
        placeholder: "请输入新密码",
        required: "请输入新密码！",
      },
    },
    action: {
      submit: "重置密码",
      backToLogin: "返回登录",
    },
  },
};
export default cn_auth;
