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
  // Không có hint → fallback Gemini leadId (Gemini tự detect lead không qua hint)
  if (!hint || !hint.trim()) {
    if (exactLeadId) {
      const lead = leads.find((l) => l.id === exactLeadId);
      if (lead) return { kind: 'single', lead, hint: lead.fullName };
    }
    return { kind: 'none', hint: hint ?? '' };
  }

  const cleaned = stripHonorifics(hint);
  const needleNorm = normalize(cleaned);
  if (!needleNorm) return { kind: 'none', hint };

  // Score each lead by token overlap
  // - 100 = exact full name match
  // - 90  = nhiều-token match (≥ 2 tokens needle), phần lớn full name khớp
  // - 50  = last-name token match (user chỉ nói tên riêng → ambiguous nếu nhiều lead cùng họ)
  // - 20  = any token match
  //
  // IMPORTANT: score 90 yêu cầu needleTokens.length >= 2 để tránh bug
  // "Giang" (1 token) match "Hoàng Giang" (2 tokens) → passes nameTokens-1=1
  // trivially, trong khi ngữ nghĩa chỉ là last-name match (50).
  const scored = leads
    .map((lead) => {
      const nameNorm = normalize(lead.fullName);
      const nameTokens = nameNorm.split(/\s+/);
      const needleTokens = needleNorm.split(/\s+/);

      if (nameNorm === needleNorm) return { lead, score: 100 };

      // Multi-token full-name-ish match: cần ≥ 2 needle tokens VÀ cover
      // phần lớn name tokens. Tránh single-token needle trigger nhầm.
      const allMatch = needleTokens.every((t) => nameTokens.some((n) => n.includes(t)));
      if (
        allMatch &&
        needleTokens.length >= 2 &&
        needleTokens.length >= nameTokens.length - 1
      ) {
        return { lead, score: 90 };
      }

      // Last name match (tên riêng thường ở cuối trong VN) — ambiguous-by-design
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

  // Client fuzzy không match ai → fallback Gemini leadId (Gemini có thể
  // hiểu context mà client fuzzy thuần text không bắt được, VD "khách dự
  // án Sky Garden" không có tên nhưng Gemini biết lead duy nhất project đó)
  if (scored.length === 0) {
    if (exactLeadId) {
      const lead = leads.find((l) => l.id === exactLeadId);
      if (lead) return { kind: 'single', lead, hint };
    }
    return { kind: 'none', hint };
  }

  const top = scored[0];

  // Disambiguation-first: có ≥ 2 candidates cùng tier (VD "Giang" match
  // "Đỗ Thanh Giang" + "Hoàng Giang") → LUÔN force user pick, KHÔNG trust
  // Gemini's leadId guess. Gemini hay overconfident chọn bừa 1 trong các
  // match tương đương → gây sai lead. Client fuzzy là source of truth.
  const tied = scored.filter((x) => x.score >= top.score - 10);
  if (tied.length > 1) {
    return { kind: 'multiple', candidates: tied.map((x) => x.lead), hint };
  }

  // Single unambiguous → return top
  return { kind: 'single', lead: top.lead, hint };
}
