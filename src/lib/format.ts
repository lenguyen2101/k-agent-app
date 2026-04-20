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
