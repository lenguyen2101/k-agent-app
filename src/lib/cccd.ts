// CCCD (Căn cước công dân) QR parser cho Việt Nam.
//
// Format chuẩn Bộ Công an 2021+: các field ngăn bằng `|`
//   0: số CCCD 12 digits (VD "001234567890")
//   1: số CMND cũ 9 digits (optional, có thể rỗng)
//   2: họ tên full (uppercase, không dấu)
//   3: ngày sinh (DDMMYYYY)
//   4: giới tính ("NAM" | "NU" | "NỮ")
//   5: địa chỉ thường trú
//   6: ngày cấp (DDMMYYYY)
//
// VD: "001234567890|012345678|NGUYEN VAN A|01011990|NAM|So 1, P. Ba Dinh, Ha Noi|01012020"

export type CccdData = {
  idNumber: string;          // 12 digits
  oldIdNumber?: string;      // 9 digits nếu có
  fullName: string;          // đã convert Title Case có dấu (nếu có thể)
  fullNameRaw: string;       // nguyên văn từ QR (uppercase không dấu)
  birthDate: string;         // DD/MM/YYYY format
  birthDateISO?: string;     // ISO nếu parse được
  gender: 'NAM' | 'NỮ' | 'KHÁC';
  address: string;
  issueDate?: string;        // DD/MM/YYYY
  issueDateISO?: string;
};

function parseDDMMYYYY(str: string): { display: string; iso?: string } | null {
  if (!/^\d{8}$/.test(str)) return null;
  const dd = str.slice(0, 2);
  const mm = str.slice(2, 4);
  const yyyy = str.slice(4, 8);
  const display = `${dd}/${mm}/${yyyy}`;
  const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  const iso = Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  return { display, iso };
}

function toTitleCaseName(upper: string): string {
  return upper
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function parseGender(raw: string): 'NAM' | 'NỮ' | 'KHÁC' {
  const g = raw.trim().toUpperCase();
  if (g === 'NAM' || g === 'M' || g === 'MALE') return 'NAM';
  if (g === 'NU' || g === 'NỮ' || g === 'F' || g === 'FEMALE') return 'NỮ';
  return 'KHÁC';
}

export function parseCccd(rawQr: string): CccdData | null {
  const parts = rawQr.trim().split('|').map((p) => p.trim());
  if (parts.length < 5) return null;

  const [idNumber, oldIdNumber, fullNameRaw, birthRaw, genderRaw, addressRaw, issueRaw] = parts;

  // Basic validation — CCCD phải 12 digits
  if (!/^\d{12}$/.test(idNumber)) return null;
  if (!fullNameRaw) return null;

  const birth = parseDDMMYYYY(birthRaw);
  if (!birth) return null;

  const issue = issueRaw ? parseDDMMYYYY(issueRaw) : null;

  return {
    idNumber,
    oldIdNumber: oldIdNumber && /^\d{9}$/.test(oldIdNumber) ? oldIdNumber : undefined,
    fullName: toTitleCaseName(fullNameRaw),
    fullNameRaw,
    birthDate: birth.display,
    birthDateISO: birth.iso,
    gender: parseGender(genderRaw ?? ''),
    address: addressRaw?.trim() ?? '',
    issueDate: issue?.display,
    issueDateISO: issue?.iso,
  };
}

// Mask số CCCD cho display (giống cccdMasked trong NoxhProfile): "****1234"
export function maskCccd(idNumber: string): string {
  if (idNumber.length < 4) return idNumber;
  return `****${idNumber.slice(-4)}`;
}
