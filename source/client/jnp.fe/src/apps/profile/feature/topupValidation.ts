export const TOPUP_PRESETS = [
  { label: "+5 triệu", value: 5_000_000 },
  { label: "+10 triệu", value: 10_000_000 },
  { label: "+20 triệu", value: 20_000_000 },
  { label: "+50 triệu", value: 50_000_000 },
  { label: "+100 triệu", value: 100_000_000 },
  { label: "+500 triệu", value: 500_000_000 },
];

export const MIN_TOPUP = 1_000_000;
export const MAX_TOPUP = 10_000_000_000;

export const validateTopupAmount = (amount?: number): string | null => {
  if (amount == null || isNaN(amount) || amount <= 0) {
    return "Vui lòng nhập số tiền hợp lệ";
  }
  if (amount < MIN_TOPUP) {
    return `Số tiền nạp tối thiểu là ${MIN_TOPUP.toLocaleString("vi-VN")} ₫`;
  }
  if (amount > MAX_TOPUP) {
    return `Số tiền nạp tối đa là ${MAX_TOPUP.toLocaleString("vi-VN")} ₫`;
  }
  return null;
};

