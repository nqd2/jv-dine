import type { Language } from "./jvdine-language";

export type ForgotPasswordCopy = {
  title: string;
  description: string;
  hint: string;
  email: string;
  placeholder: string;
  back: string;
  notify: string;
  toast: string;
};

export const FORGOT_PASSWORD_COPY_BY_LANGUAGE: Record<
  Language,
  ForgotPasswordCopy
> = {
  JP: {
    title: "パスワードリセット",
    description:
      "メール宛にパスワード再設定リンクを送信する機能は開発中です。後日ご利用いただけます。",
    hint: '緊急の場合は運営窓口までご連絡いただくか、"ログイン"にお戻りください。',
    email: "メール",
    placeholder: "your@email.com",
    back: "ログインへ戻る",
    notify: "通知を送信",
    toast: "受け付けました（デモのみでメール送信はありません）。",
  },
  VN: {
    title: "Đặt lại mật khẩu",
    description:
      "Tính năng gửi email đặt lại mật khẩu hiện chưa hoàn thành.",
    hint: "Vui lòng quay lại trang Đăng nhập hoặc liên hệ hỗ trợ nếu cần.",
    email: "Email",
    placeholder: "your@email.com",
    back: "Trở về đăng nhập",
    notify: "Gửi",
    toast: "Đã ghi nhận (chỉ demo, không gửi email).",
  },
};
