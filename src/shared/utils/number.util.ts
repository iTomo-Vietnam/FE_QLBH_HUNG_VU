import { FormatData, SymbolPosition } from "@/shared/interfaces/format";
import { DiscountType } from "@/shared/constants/enum";

export const formatNumber = (
  value: number | string,
  decimalPrecision: number,
  thousandSeparator: string,
  decimalSeparator: string,
): string => {
  const locale = thousandSeparator === "," ? "en-US" : "vi-VN";
  const numericValue = Number(value) || 0;

  const formatted = numericValue.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPrecision,
  });

  return formatted;
};

export const formatCurrency = (
  value: number,
  decimalPrecision: number,
  thousandSeparator: string,
  decimalSeparator: string,
  symbolPosition: SymbolPosition,
): string => {
  const formattedNumber = formatNumber(
    value,
    decimalPrecision,
    thousandSeparator,
    decimalSeparator,
  );

  if (symbolPosition === "before") {
    return `₫ ${formattedNumber}`;
  } else if (symbolPosition === "after") {
    return `${formattedNumber} ₫`;
  }
  return formattedNumber; // Không hiển thị ký hiệu
};

export function formatPercentage(value?: number | null, format?: FormatData | null): string {
  if (!value) return "";
  return (
    formatNumber(
      value,
      format?.numberFormat?.decimalPrecision || 2,
      format?.numberFormat?.thousandSeparator || ",",
      format?.numberFormat?.decimalSeparator || ".",
    ) + "%"
  );
}

export const formatMoney = (value?: number | null, format?: FormatData | null) => {
  if (!value) return "";
  const { currency, numberFormat } = format || {};
  const { decimalPrecision = 0, symbolPosition = "none" } = currency || {};
  const { thousandSeparator = ",", decimalSeparator = "." } = numberFormat || {};

  return formatCurrency(
    value || 0,
    decimalPrecision,
    thousandSeparator,
    decimalSeparator,
    symbolPosition,
  );
};

export const formatVnd = (value: unknown) => `${formatMoney(Number(value || 0)) || "0"} đ`;

export const formatQuantity = (value?: number | null, format?: FormatData | null) => {
  if (!value) return "";
  const { currency, numberFormat } = format || {};
  const { decimalPrecision = 9 } = currency || {};
  const { thousandSeparator = ",", decimalSeparator = "." } = numberFormat || {};

  return formatNumber(value, decimalPrecision, thousandSeparator, decimalSeparator);
};

export const formatShortMoney = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

/**
 * Chuyển đổi số thành chữ tiếng Việt
 */
function convertGroupToWords(num: number, units: string[]): string {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;

  let result = "";

  if (hundred > 0) {
    result += units[hundred] + " trăm";
  }

  if (ten > 1) {
    result += " " + units[ten] + " mươi";
  } else if (ten === 1) {
    result += " mười";
  }

  if (unit > 0) {
    if (ten > 1 && unit === 1) {
      result += " mốt";
    } else if (ten > 0 && unit === 5) {
      result += " lăm";
    } else {
      result += " " + units[unit];
    }
  }

  return result.trim();
}

export function numberToVietnameseWords(num?: number | null): string {
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const levels = ["", "nghìn", "triệu", "tỷ"];

  if (!num) return "Không đồng";

  let result = "";
  let levelIndex = 0;

  while (num > 0) {
    const group = num % 1000;
    if (group !== 0) {
      const groupText = convertGroupToWords(group, units);
      result = groupText + " " + levels[levelIndex] + " " + result;
    }
    num = Math.floor(num / 1000);
    levelIndex++;
  }

  return result.trim().charAt(0).toUpperCase() + result.trim().slice(1) + " đồng";
}

export function getDiscontContent<
  T extends {
    discountType?: DiscountType | null;
    discountValue?: number | null;
  },
>(data: T): string {
  if (!data.discountType || !data.discountValue) return "";

  if (data.discountType === DiscountType.PERCENT) {
    return `${data.discountValue}%`;
  }

  return formatMoney(data.discountValue);
}

export const getCashSuggestions = (paymentDue: number) => {
  if (!paymentDue || paymentDue <= 0) return [];

  const suggestions = new Set<number>();

  suggestions.add(paymentDue);

  // Các mệnh giá/tổ hợp tiền thực dụng
  const steps = [10_000, 20_000, 50_000];
  const smallestStep = steps[0];
  const firstRoundedAmount = Math.ceil(paymentDue / smallestStep) * smallestStep;

  // Các số tiền tiếp theo vẫn có thể ghép từ mệnh giá 10k/20k/50k.
  // Ví dụ: 475k -> 480k -> 490k -> 500k.
  suggestions.add(firstRoundedAmount + smallestStep);

  // Tìm các giá trị tiếp theo bằng cách cộng các mệnh giá
  // nhưng không tạo chuỗi cộng dồn từ option trước.
  for (const step of steps) {
    const amount = Math.ceil(paymentDue / step) * step;

    suggestions.add(amount);
  }

  // Các mốc tròn 100k
  suggestions.add(Math.ceil(paymentDue / 100_000) * 100_000);

  // Các mốc 500k
  if (paymentDue < 500_000) {
    suggestions.add(500_000);
  }

  return [...suggestions].filter((amount) => amount >= paymentDue).sort((a, b) => a - b);
};

/** Gợi ý tiền mặt cho thanh toán kết hợp: luôn là mệnh giá tròn và nhỏ hơn tổng cần thu. */
export const getCombinedCashSuggestions = (paymentDue: number) => {
  if (!paymentDue || paymentDue <= 0) return [];

  const steps = [10_000, 20_000, 50_000, 100_000, 500_000];
  const suggestions = new Set<number>();
  for (const step of steps) {
    const amount = Math.floor(paymentDue / step) * step;
    if (amount > 0 && amount < paymentDue) suggestions.add(amount);
  }

  return [...suggestions].sort((a, b) => a - b);
};
