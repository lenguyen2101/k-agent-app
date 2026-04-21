import * as FileSystem from 'expo-file-system/legacy';
import { projects } from '@/mock/projects';

// Gemini 2.5 Flash — 1 call: audio inline → structured JSON lead extraction.
// Audio recorded bằng expo-audio (iOS m4a/AAC default) → base64 → inline request.
// responseSchema đảm bảo JSON output, không cần parse markdown fences.

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export type ExtractedLead = {
  fullName: string | null;
  phone: string | null;
  projectId: string | null;
  projectHint: string | null;
  unitTypeInterests: string[];
  notes: string | null;
  followupHours: number | null;
  transcript: string;
};

const projectList = projects
  .map((p) => `- id "${p.id}": ${p.shortName} / ${p.name} tại ${p.location}`)
  .join('\n');

const PROMPT = `Bạn là AI trợ lý của nhân viên sale bất động sản Việt Nam. Người dùng vừa nói 1 đoạn mô tả khách hàng tiềm năng (lead). Hãy nghe kỹ và extract thông tin thành JSON theo schema.

Quy tắc:
- "fullName": họ tên đầy đủ của khách (nếu có). Viết hoa đầu từ, tiếng Việt có dấu.
- "phone": số điện thoại Việt Nam 10 số bắt đầu bằng 09/08/07/05/03. Loại bỏ dấu cách/chấm/dấu gạch.
- "projectId": match với 1 trong các project ID sau nếu khách quan tâm (dựa vào tên hoặc location):
${projectList}
  Nếu không match → null.
- "projectHint": string mô tả project/khu vực khách quan tâm, ngay cả khi không match projectId (vd "khu vực Quận 7", "dự án Vinhomes").
- "unitTypeInterests": mảng các loại căn trong ["Studio","1PN","2PN","3PN"]. "1 phòng ngủ"="1PN", "2 phòng"="2PN", "studio"/"không phòng"="Studio". Nếu không đề cập → mảng rỗng.
- "notes": tóm tắt các thông tin khác (thu nhập, gia cảnh, nhu cầu đặc biệt, ghi chú). Tiếng Việt có dấu, ngắn gọn.
- "followupHours": số giờ từ HIỆN TẠI đến lúc cần follow up tiếp (nếu khách đề cập). Ví dụ "chiều mai" = ~24 giờ, "thứ 7" = tính số giờ đến thứ 7, "1 tuần nữa" = 168. Nếu không đề cập → null.
- "transcript": toàn bộ nội dung khách vừa nói (plain text, không format).

LUÔN trả JSON hợp lệ. Nếu không nghe rõ field nào → dùng null hoặc mảng rỗng. KHÔNG bịa thông tin.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    fullName: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    projectId: { type: 'string', nullable: true },
    projectHint: { type: 'string', nullable: true },
    unitTypeInterests: {
      type: 'array',
      items: { type: 'string', enum: ['Studio', '1PN', '2PN', '3PN'] },
    },
    notes: { type: 'string', nullable: true },
    followupHours: { type: 'number', nullable: true },
    transcript: { type: 'string' },
  },
  required: ['transcript', 'unitTypeInterests'],
} as const;

export async function extractLeadFromAudio(audioUri: string): Promise<ExtractedLead> {
  if (!API_KEY) {
    throw new Error('Thiếu EXPO_PUBLIC_GEMINI_API_KEY trong .env');
  }

  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const mimeType = audioUri.endsWith('.wav')
    ? 'audio/wav'
    : audioUri.endsWith('.mp3')
      ? 'audio/mp3'
      : 'audio/mp4';

  const body = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini không trả về nội dung');
  }

  const parsed = JSON.parse(text) as ExtractedLead;
  return {
    fullName: parsed.fullName ?? null,
    phone: parsed.phone ?? null,
    projectId: parsed.projectId ?? null,
    projectHint: parsed.projectHint ?? null,
    unitTypeInterests: parsed.unitTypeInterests ?? [],
    notes: parsed.notes ?? null,
    followupHours: parsed.followupHours ?? null,
    transcript: parsed.transcript ?? '',
  };
}

// Simple speech-to-text transcription for chat voice input.
// Chỉ lấy text, không structured extract như extractLeadFromAudio.
export async function transcribeAudio(audioUri: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Thiếu EXPO_PUBLIC_GEMINI_API_KEY trong .env');
  }

  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const mimeType = audioUri.endsWith('.wav')
    ? 'audio/wav'
    : audioUri.endsWith('.mp3')
      ? 'audio/mp3'
      : 'audio/mp4';

  const body = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType, data: base64 } },
          {
            text:
              'Bạn là công cụ chuyển giọng nói tiếng Việt thành văn bản. Hãy nghe đoạn audio và trả về CHÍNH XÁC lời người nói, có dấu tiếng Việt. Không thêm lời dẫn, chỉ trả text thuần. Giữ nguyên câu hỏi/câu cảm của người nói.',
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Không nghe rõ giọng nói, thử lại nha');
  }
  return text.trim();
}
