import type { Lead } from '@/types/lead';

// Fuzzy match lead từ hint text ("anh Bình", "chị Linh", "Nguyễn Văn A").
// Dùng sau khi Gemini extractTask trả về leadHint + (optional) leadId.
//
// Strategy:
// 1. Nếu có leadId từ Gemini → lookup trực tiếp (authoritative)
// 2. Nếu không → normalize VN diacritics + so token của fullName vs hint
// 3. Ưu tiên: exact full match > last-name match > any-token match
// 4. Trả về result variant rõ ràng để caller xử lý UI (no/single/multiple)

// Remove Vietnamese diacritics + lowercase + trim
// "Nguyễn Văn Bình" → "nguyen van binh"
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove combining marks
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim();
}

// Remove Vietnamese honorifics khỏi hint trước khi match:
// "anh Bình" → "Bình"
// "chị Thanh Giang" → "Thanh Giang"
const HONORIFICS = ['anh', 'chị', 'chi', 'em', 'bác', 'bac', 'cô', 'co', 'chú', 'chu', 'ông', 'ong', 'bà', 'ba', 'thầy', 'thay', 'cậu', 'cau'];

function stripHonorifics(hint: string): string {
  const tokens = hint.split(/\s+/).filter(Boolean);
  const stripped = tokens.filter((t, i) => {
    // Chỉ strip honorific ở đầu câu (vị trí 0)
    return !(i === 0 && HONORIFICS.includes(normalize(t)));
  });
  return stripped.join(' ').trim();
}

export type LeadMatchResult =
  | { kind: 'none'; hint: string }
  | { kind: 'single'; lead: Lead; hint: string }
  | { kind: 'multiple'; candidates: Lead[]; hint: string };

export function matchLeadFromHint(
  leads: Lead[],
  hint: string | null,
  exactLeadId: string | null = null
): LeadMatchResult {
  // Fast path: Gemini đã confident match
  if (exactLeadId) {
    const lead = leads.find((l) => l.id === exactLeadId);
    if (lead) return { kind: 'single', lead, hint: hint ?? lead.fullName };
  }

  if (!hint || !hint.trim()) {
    return { kind: 'none', hint: hint ?? '' };
  }

  const cleaned = stripHonorifics(hint);
  const needleNorm = normalize(cleaned);
  if (!needleNorm) return { kind: 'none', hint };

  // Score each lead by token overlap
  // - 100 = exact full name match
  // - 50 = last-name token match (phổ biến khi user chỉ nói tên riêng)
  // - 20 = any token match
  const scored = leads
    .map((lead) => {
      const nameNorm = normalize(lead.fullName);
      const nameTokens = nameNorm.split(/\s+/);
      const needleTokens = needleNorm.split(/\s+/);

      if (nameNorm === needleNorm) return { lead, score: 100 };

      // All needle tokens present in name (in order, partial)
      const allMatch = needleTokens.every((t) => nameTokens.some((n) => n.includes(t)));
      if (allMatch && needleTokens.length >= nameTokens.length - 1) {
        // Phần lớn full name khớp → high confidence
        return { lead, score: 90 };
      }

      // Last name match (tên riêng thường ở cuối trong VN)
      const lastName = nameTokens[nameTokens.length - 1];
      if (needleTokens.some((t) => lastName === t || lastName.includes(t))) {
        return { lead, score: 50 };
      }

      // Any token overlap
      if (needleTokens.some((t) => nameTokens.some((n) => n === t))) {
        return { lead, score: 20 };
      }

      return { lead, score: 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { kind: 'none', hint };
  }

  const top = scored[0];

  // Nếu top score ≥ 90 VÀ các cái khác thấp hơn hẳn (gap > 30) → confident single
  const runnerUp = scored[1];
  if (top.score >= 90 && (!runnerUp || top.score - runnerUp.score >= 30)) {
    return { kind: 'single', lead: top.lead, hint };
  }

  // Nếu tất cả cùng tier score (≤ 50) VÀ có nhiều candidates → multiple
  const tied = scored.filter((x) => x.score >= top.score - 10);
  if (tied.length > 1) {
    return { kind: 'multiple', candidates: tied.map((x) => x.lead), hint };
  }

  // Single top score
  return { kind: 'single', lead: top.lead, hint };
}
