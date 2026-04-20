export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHour = Math.round(diffMs / 3600_000);
  const diffDay = Math.round(diffMs / 86400_000);

  if (Math.abs(diffMin) < 1) return 'vừa xong';
  if (Math.abs(diffMin) < 60) {
    return diffMin > 0 ? `trong ${diffMin} phút` : `${-diffMin} phút trước`;
  }
  if (Math.abs(diffHour) < 24) {
    return diffHour > 0 ? `trong ${diffHour} tiếng` : `${-diffHour} tiếng trước`;
  }
  return diffDay > 0 ? `trong ${diffDay} ngày` : `${-diffDay} ngày trước`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

// "3,437,466,000 đ" — full number với separator Việt.
export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

// "3,4 tỷ" / "180 tr" / "900 nghìn" — compact cho card / badge.
export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    const v = amount / 1_000_000_000;
    return `${v.toFixed(v >= 10 ? 0 : 1).replace('.', ',')} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${Math.round(amount / 1_000_000)} tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)} nghìn`;
  }
  return `${amount}`;
}

// "50,5 tr/m²" — rút gọn price per m² cho row thông tin giá.
export function formatPricePerM2(pricePerM2: number): string {
  if (pricePerM2 >= 1_000_000) {
    const v = pricePerM2 / 1_000_000;
    return `~${v.toFixed(v >= 100 ? 0 : 1).replace('.', ',')} tr/m²`;
  }
  return `${pricePerM2.toLocaleString('vi-VN')} đ/m²`;
}

// "Ba tỷ bốn trăm ba mươi bảy triệu..." — đọc số VND thành chữ Việt.
// Rule-based, chia theo bậc tỷ/triệu/nghìn. Chuẩn đủ cho Listing Detail.
const digitWords = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(n: number, withLeadingZero: boolean): string {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(`${digitWords[hundreds]} trăm`);
  } else if (withLeadingZero && (tens > 0 || ones > 0)) {
    parts.push('không trăm');
  }

  if (tens === 0 && ones > 0) {
    if (parts.length) parts.push('lẻ');
    parts.push(digitWords[ones]);
  } else if (tens === 1) {
    parts.push('mười');
    if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(digitWords[ones]);
  } else if (tens > 1) {
    parts.push(`${digitWords[tens]} mươi`);
    if (ones === 1) parts.push('mốt');
    else if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(digitWords[ones]);
  }

  return parts.join(' ');
}

export function formatVNDWords(amount: number): string {
  if (amount === 0) return 'Không đồng';
  const billions = Math.floor(amount / 1_000_000_000);
  const millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((amount % 1_000_000) / 1_000);
  const ones = amount % 1_000;

  const parts: string[] = [];
  if (billions > 0) parts.push(`${readThreeDigits(billions, false)} tỷ`);
  if (millions > 0) parts.push(`${readThreeDigits(millions, parts.length > 0)} triệu`);
  if (thousands > 0) parts.push(`${readThreeDigits(thousands, parts.length > 0)} nghìn`);
  if (ones > 0) parts.push(`${readThreeDigits(ones, parts.length > 0)}`);

  const result = `${parts.join(' ')} đồng`;
  return result.charAt(0).toUpperCase() + result.slice(1);
}
