export const en_auth = {
  header: {
    title: "National Investment One-Stop Portal",
    subtitle: "One account, multiple services",
  },
  footer: {
    note: "Fast, secure, and protected — use your National Investment One-Stop Portal account across all services.",
  },
  selection: {
    back_home: "Back to home page",
    title: "Select login method",
    subtitle: "Please choose an appropriate method to continue.",

    admin: {
      label: "For officials",
      title: "Administrator login",
      description:
        "Access the internal administration area using your assigned account.",
      highlight: {
        "1": "Log in with your official account to access the administration system.",
        "2": "Forgot your password? Use the password recovery feature.",
        "3": "For further assistance, please contact the system administrator.",
      },
      login: "Official login",
      forgot: "Forgot password",
    },

    investor: {
      label: "For investors",
      title: "Login",
      description: "Access the system using your registered investor account.",
      highlight: {
        "1": "Log in with your investor account to access services.",
        "2": "Forgot your password? Follow the recovery instructions.",
        "3": "Contact support if additional assistance is required.",
      },
      login: "Login",
      forgot: "Forgot password",
    },

    vneid: {
      label: "For individuals / organizations",
      title: "Login with VNeID",
      description:
        "Use your VNeID digital identity to access public services securely.",
      hint: "VNeID login will be available once the authentication gateway is activated.",
    },
  },
  nhadautu_forgotPassword: {
    header: {
      notice: "National Investment Single-Window Portal supports recovery",
      title: "Forgot password?",
      description:
        "Please enter your registered ID number. We will send a password reset link to your email.",
    },
    form: {
      cccd: {
        label: "ID Number",
        placeholder: "Enter ID number",
        required: "Please enter your ID number!",
        maxLength: "ID number must not exceed 12 characters!",
      },
    },
    action: {
      submit: "Send email",
      submitting: "Sending",
      backToLogin: "Back to login",
    },
  },
  forgotPassword: {
    header: {
      notice: "National Investment One-Stop Portal recovery support",
      title: "Forgot password?",
      description:
        "Please enter the email you registered. We will send a password reset link to your email.",
    },
    form: {
      username: {
        label: "Username",
      },
      email: {
        label: "Email",
      },
    },
    action: {
      submit: "Send email",
      submitting: "Sending",
      backToLogin: "Back to login",
    },
  },
  investor_login: {
    require_auth: "The National Investment Portal requires authentication",
    title: "Investor Login",
    subtitle:
      "Enter your ID number or passport and password to access your investor area.",

    account: {
      label: "ID / Citizen ID / Passport Number",
      placeholder: "Enter your ID or passport number",
    },

    password: {
      label: "Password",
    },

    submit: "Login",
    forgot: "Forgot password?",
  },
  verify: {
    loading: "Verifying...",
    success: {
      title: "Your account has been successfully verified!",
      action: "Login",
    },
    already: {
      title: "Account already verified",
      subtitle: "You can log in immediately without re-verifying.",
      action: "Login now",
    },
    error: {
      title: "Verification failed",
      subtitle: "The verification code is invalid or has expired.",
      action: "Back to homepage",
    },
  },
  reset: {
    header: "National Investment One-Stop Portal requires verification",
    title: "Reset Password",
    description: "Please enter a new password to continue using the system.",
    form: {
      newPassword: {
        label: "New password",
        placeholder: "Enter new password",
        required: "Please enter a new password!",
      },
    },
    action: {
      submit: "Reset password",
      backToLogin: "Back to login",
    },
  },
  mobile_block: {
    title: "Desktop Access Required",
    message_1: "The National Investment One-Stop Portal currently does not support mobile access.",
    message_2: "Please use a desktop computer with an appropriate screen resolution for the best experience.",
  },
  form: {
    captcha: {
      label: "Security Verification",
      loading: "Loading security verification...",
      ready: "Security verification is ready",
      v3Description: "This page is protected by Google reCAPTCHA.",
      policyPrefix: "Google's",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      policySuffix: "apply.",
      loadFailed: "Could not load security verification. Please check your internet connection and try again.",
      missingSiteKey: "reCAPTCHA Site Key is not configured",
    },
  },
};
export default en_auth;
