import type { Language } from "./jvdine-language";

export type AuthCopy = {
  login: string;
  signup: string;
  subtitleLogin: string;
  subtitleSignup: string;
  email: string;
  password: string;
  remember: string;
  forgotPassword: string;
  noAccount: string;
  hasAccount: string;
  name: string;
  phone: string;
  confirmPassword: string;
  accountType: string;
  customer: string;
  owner: string;
  terms: string;
  or: string;
  submitting: string;
  errs: {
    invalidEmail: string;
    nameRequired: string;
    passwordRequired: string;
    weakPassword: string;
    mismatchPassword: string;
    termsRequired: string;
    network: string;
    badResponse: string;
    fallback: string;
  };
};

export const AUTH_COPY_BY_LANGUAGE: Record<Language, AuthCopy> = {
  JP: {
    login: "ログイン",
    signup: "登録",
    subtitleLogin: "アカウントにログインする",
    subtitleSignup: "新しいアカウントを作成する",
    email: "メール",
    password: "パスワード",
    remember: "ログイン状態を保持",
    forgotPassword: "パスワード忘れ",
    noAccount: "アカウントをお持ちでない場合?",
    hasAccount: "すでにアカウントをお持ちの場合?",
    name: "名前",
    phone: "電話番号",
    confirmPassword: "パスワード確認",
    accountType: "アカウント種別",
    customer: "お客様",
    owner: "店舗オーナー",
    terms: "利用規約に同意する",
    or: "または",
    submitting: "処理中…",
    errs: {
      invalidEmail: "メール形式が正しくありません。",
      nameRequired: "名前を入力してください。",
      passwordRequired: "パスワードを入力してください。",
      weakPassword: "パスワードは8文字以上である必要があります。",
      mismatchPassword: "パスワード（確認）が一致しません。",
      termsRequired: "利用規約に同意してください。",
      network:
        "サーバーに接続できませんでした。ネットワークとAPIのアドレスをご確認ください。",
      badResponse: "サーバーからの応答を読み取れませんでした。",
      fallback: "リクエストに失敗しました。",
    },
  },
  VN: {
    login: "Đăng nhập",
    signup: "Đăng ký",
    subtitleLogin: "Đăng nhập vào tài khoản",
    subtitleSignup: "Tạo tài khoản mới",
    email: "Email",
    password: "Mật khẩu",
    remember: "Giữ trạng thái đăng nhập",
    forgotPassword: "Quên mật khẩu",
    noAccount: "Chưa có tài khoản?",
    hasAccount: "Đã có tài khoản?",
    name: "Tên",
    phone: "Số điện thoại",
    confirmPassword: "Xác nhận mật khẩu",
    accountType: "Loại tài khoản",
    customer: "Khách hàng",
    owner: "Chủ nhà hàng",
    terms: "Đồng ý điều khoản sử dụng",
    or: "hoặc",
    submitting: "Đang xử lý…",
    errs: {
      invalidEmail: "Email không hợp lệ.",
      nameRequired: "Vui lòng nhập tên.",
      passwordRequired: "Vui lòng nhập mật khẩu.",
      weakPassword: "Mật khẩu cần tối thiểu 8 ký tự.",
      mismatchPassword: "Mật khẩu xác nhận không trùng khớp.",
      termsRequired: "Hãy đồng ý điều khoản sử dụng.",
      network:
        "Không kết nối được đến máy chủ. Kiểm tra mạng và NEXT_PUBLIC_API_BASE_URL.",
      badResponse: "Không đọc được phản hồi từ máy chủ.",
      fallback: "Yêu cầu thất bại.",
    },
  },
};

export const AUTH_SERVER_MESSAGES: Record<Language, Record<string, string>> = {
  JP: {
    "Invalid email or password":
      "メールアドレスまたはパスワードが正しくありません。",
    "Email format is invalid": "メール形式が正しくありません。",
    "password is required": "パスワードを入力してください。",
    "email is required": "メールアドレスを入力してください。",
    "username is required": "お名前を入力してください。",
    "refreshToken is required": "セッションの更新に失敗しました。",
    "Password must be at least 8 characters":
      "パスワードは8文字以上である必要があります。",
    "Password confirmation does not match":
      "パスワード（確認）が一致しません。",
    "Terms must be accepted": "利用規約に同意してください。",
    "Email is already registered": "このメールアドレスは既に登録されています。",
  },
  VN: {
    "Invalid email or password": "Email hoặc mật khẩu không đúng.",
    "Email format is invalid": "Email không hợp lệ.",
    "password is required": "Vui lòng nhập mật khẩu.",
    "email is required": "Vui lòng nhập email.",
    "username is required": "Vui lòng nhập tên.",
    "refreshToken is required": "Không thể làm mới phiên.",
    "Password must be at least 8 characters": "Mật khẩu cần tối thiểu 8 ký tự.",
    "Password confirmation does not match":
      "Mật khẩu xác nhận không trùng khớp.",
    "Terms must be accepted": "Hãy đồng ý điều khoản sử dụng.",
    "Email is already registered": "Email này đã được đăng ký.",
  },
};
