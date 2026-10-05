export const jp_auth = {
  header: {
    title: "国家投資ワンストップポータル",
    subtitle: "1つのアカウントで、複数のサービスを利用",
  },
  footer: {
    note: "迅速・安全・信頼 — 国家投資ワンストップポータルのアカウントで、すべてのサービスをご利用いただけます。",
  },
  selection: {
    back_home: "ホームに戻る",
    title: "ログイン方法を選択",
    subtitle: "続行するには、適切な方法を選択してください。",

    admin: {
      label: "職員向け",
      title: "管理者ログイン",
      description:
        "付与されたアカウントを使用して内部管理システムにアクセスします。",
      highlight: {
        "1": "付与された職員アカウントでログインし、管理システムへアクセスします。",
        "2": "パスワードをお忘れですか？パスワード再設定機能をご利用ください。",
        "3": "追加のサポートが必要な場合は、システム管理部門へお問い合わせください。",
      },
      login: "職員ログイン",
      forgot: "パスワードを忘れた場合",
    },

    investor: {
      label: "投資家向け",
      title: "ログイン",
      description:
        "登録済みの投資家アカウントを使用してシステムにアクセスします。",
      highlight: {
        "1": "投資家アカウントでログインし、各種サービスを利用できます。",
        "2": "パスワードを忘れた場合は、再設定手続きを行ってください。",
        "3": "ご不明な点がある場合は、サポート窓口までご連絡ください。",
      },
      login: "ログイン",
      forgot: "パスワードを忘れた場合",
    },

    vneid: {
      label: "個人 / 組織向け",
      title: "VNeID でログイン",
      description:
        "VNeID デジタルIDを使用して、安全かつ迅速にオンライン公共サービスへアクセスできます。",
      hint: "VNeID ログイン機能は、認証ゲートウェイが有効化され次第ご利用いただけます。",
    },
  },
  nhadautu_forgotPassword: {
    header: {
      notice: "国家投資ワンストップポータルはアカウント復旧をサポートします",
      title: "パスワードをお忘れですか？",
      description:
        "登録した身分証番号を入力してください。パスワード再設定リンクをメールで送信します。",
    },
    form: {
      cccd: {
        label: "身分証番号",
        placeholder: "身分証番号を入力",
        required: "身分証番号を入力してください！",
        maxLength: "身分証番号は12文字以内で入力してください！",
      },
    },
    action: {
      submit: "メール送信",
      submitting: "送信中",
      backToLogin: "ログインに戻る",
    },
  },
  forgotPassword: {
    header: {
      notice: "国家投資ワンストップポータル 復旧サポート",
      title: "パスワードをお忘れですか？",
      description:
        "登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。",
    },
    form: {
      username: {
        label: "ユーザー名",
      },
      email: {
        label: "メールアドレス",
      },
    },
    action: {
      submit: "メールを送信",
      submitting: "送信中",
      backToLogin: "ログインに戻る",
    },
  },
  investor_login: {
    require_auth: "国家投資ポータルでは認証が必要です",
    title: "投資家ログイン",
    subtitle:
      "本人確認書類番号とパスワードを入力して、投資家専用エリアにアクセスしてください。",

    account: {
      label: "身分証明書 / パスポート番号",
      placeholder: "身分証明書またはパスポート番号を入力",
    },

    password: {
      label: "パスワード",
    },

    submit: "ログイン",
    forgot: "パスワードを忘れた場合",
  },
  verify: {
    loading: "確認中...",
    success: {
      title: "アカウントが正常に認証されました！",
      action: "ログイン",
    },
    already: {
      title: "すでに認証済みです",
      subtitle: "再認証せずにすぐログインできます。",
      action: "今すぐログイン",
    },
    error: {
      title: "認証に失敗しました",
      subtitle: "認証コードが無効、または期限切れです。",
      action: "ホームに戻る",
    },
  },
  reset: {
    header: "国家投資ワンストップポータルは認証を要求しています",
    title: "パスワード再設定",
    description: "新しいパスワードを入力して続行してください。",
    form: {
      newPassword: {
        label: "新しいパスワード",
        placeholder: "新しいパスワードを入力",
        required: "新しいパスワードを入力してください！",
      },
    },
    action: {
      submit: "パスワードを再設定",
      backToLogin: "ログインに戻る",
    },
  },
};
export default jp_auth;
