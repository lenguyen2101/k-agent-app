# Lead Data Model — K-Agent

> **Status:** v0.2 — đã sync user answers (2026-04-19), pending Tech Lead BE
> **Product:** Nhà ở xã hội (NOXH) tại Việt Nam
> **Last updated:** 2026-04-19

## 1. Lead Entity (đề xuất)

```graphql
type Lead {
  id: ID!                        # UUID server-generated
  clientId: String               # UUID client-generated, dùng cho idempotency offline
  phone: String!                 # SĐT khách (chuẩn hóa +84)
  fullName: String
  source: LeadSource!            # nguồn lead — xem §2
  status: LeadStatus!            # trạng thái — xem §3
  assignedTo: User               # sale đang phụ trách (null = trong pool)
  team: Team                     # team của assignedTo
  primaryProject: Project!       # 1 lead = 1 dự án chính
  alternativeProjects: [Project!] # dự án thay thế nếu primary không phù hợp (linh hoạt chuyển)
  unitTypeInterests: [String!]   # loại căn quan tâm: studio/1PN/2PN/3PN
  nextFollowupAt: DateTime       # lịch chăm sóc kế tiếp
  expiresAt: DateTime            # hết hạn → trả về pool nếu chưa chốt
  notes: String                  # ghi chú free-text (dùng thay cho budget chi tiết, lý do CLOSED_LOST...)
  noxhProfile: NoxhProfile       # link sang user noxh.net nếu source = NOXH_PLATFORM (eKYC data)
  activities: [Activity!]!       # lịch sử tương tác — xem §4
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User!               # admin/marketer/AI allocator
  customFields: JSON             # mở rộng (escape hatch)
}

type NoxhProfile {
  noxhUserId: ID!                # user_id bên noxh.net
  ekycVerified: Boolean!
  fullNameVerified: String       # tên đã eKYC
  cccdMasked: String             # 4 số cuối CCCD
  socialHousingEligible: Boolean # đủ điều kiện mua NOXH? (rule luật NOXH VN)
  province: String               # tỉnh/thành đăng ký
}

enum LeadSource {
  NOXH_PLATFORM    # organic từ noxh.net (đã eKYC) — nguồn chính
  FACEBOOK_ADS
  HOTLINE
  WALK_IN          # khách đến trực tiếp showroom/sàn
  REFERRAL         # khách giới thiệu
  EVENT            # sự kiện mở bán
  ZALO
  OTHER
}

enum LeadStatus {
  NEW              # mới nhận, chưa liên hệ
  CONTACTED        # đã gọi/nhắn lần đầu
  INTERESTED       # quan tâm, đang trao đổi
  APPOINTMENT      # đã hẹn xem dự án
  VISITED          # đã đi xem
  NEGOTIATING      # đàm phán giá/ưu đãi
  DEPOSITED        # đã đặt cọc
  CONTRACTED       # đã ký HĐMB
  CLOSED_WON       # bàn giao xong (chốt thành công)
  CLOSED_LOST      # rớt — kèm reason
  ON_HOLD          # tạm dừng theo dõi
}
```

## 2. Decisions (đã chốt sau user input 2026-04-19)

| # | Decision | Note |
|---|----------|------|
| Lead source | 8 nguồn (xem `LeadSource` enum) — `NOXH_PLATFORM` là nguồn chính | Bỏ Google, TikTok |
| Status pipeline | Giữ 11 status NEW → ... → CLOSED_WON/LOST/ON_HOLD | + free-text `notes` cho ghi chú thêm |
| CLOSED_LOST reason | KHÔNG có enum — dùng `notes` free-text | Sale tự điền |
| Ownership | 1 lead = 1 sale, sale chỉ thấy lead của mình | Không share |
| Lead allocation | **AI auto-allocation** kiểu Grab — server tự gán sale cho lead mới | Mới! Xem §5 |
| Project | 1 lead = 1 `primaryProject`, có `alternativeProjects[]` để chuyển hóa | Linh hoạt |
| Multi-tenant | Phase MVP chỉ 1 sàn — bỏ qua scoping | Mở rộng phase sau |
| Activity outcome | Giữ 6 outcome | OK |
| Budget | KHÔNG track chi tiết | Phase này chỉ đến booking, sau đó push CRM Microsoft Dynamics |
| Custom fields | Dùng cho field đặc thù NOXH | Eligibility, hộ khẩu, thu nhập... |

## 2b. NOXH-specific custom fields (đề xuất)

Theo luật Nhà ở xã hội Việt Nam (Luật Nhà ở 2023, Nghị định 100/2024/NĐ-CP), khách mua NOXH cần đủ điều kiện. Sale cần track:

```graphql
# customFields.noxhEligibility
{
  "incomeBracket": "below_15m" | "15m_to_30m" | "above_30m",  # thu nhập tháng VND
  "hasOwnedHouse": false,
  "registeredProvinceMatch": true,        # hộ khẩu/tạm trú khớp dự án
  "priorityGroup": "worker" | "officer" | "low_income" | "veteran" | "none",
  "documentChecklist": {
    "incomeProof": false,
    "marriageCert": false,
    "householdRegistration": false,
    "priorityProof": false
  }
}
```

**TODO:** confirm với user các field NOXH chính xác cần track (có thể outsource sang admin web, mobile chỉ display).

## 3. Activity Log

```graphql
type Activity {
  id: ID!
  clientId: String
  leadId: ID!
  type: ActivityType!
  content: String                # nội dung ghi chú
  outcome: ActivityOutcome       # kết quả cuộc gọi/gặp
  scheduledAt: DateTime          # với APPOINTMENT/FOLLOWUP — thời điểm đã hẹn
  durationSeconds: Int           # với CALL — thời lượng
  attachments: [Attachment!]     # ảnh, file
  createdBy: User!
  createdAt: DateTime!
}

enum ActivityType {
  CALL              # gọi điện
  SMS               # nhắn tin
  ZALO_MESSAGE
  EMAIL
  MEETING           # gặp trực tiếp / đi xem dự án
  NOTE              # ghi chú nội bộ
  STATUS_CHANGE     # tự động khi đổi status
  ASSIGNMENT_CHANGE # tự động khi đổi assignedTo
  FOLLOWUP_SCHEDULED
}

enum ActivityOutcome {
  REACHED            # liên lạc được
  NO_ANSWER          # không bắt máy
  WRONG_NUMBER
  CALLBACK_LATER
  NOT_INTERESTED
  INTERESTED
}
```

## 5. AI Lead Allocation (mới — kiểu Grab)

System tự phân bổ lead mới về 1 sale duy nhất, không cần sale pick. Tương tự Grab gán cuốc cho driver.

### Allocation criteria (đề xuất — chờ user confirm)
1. **Workload balance** — sale đang giữ < trung bình
2. **Acceptance rate** — sale có rate accept lead cao
3. **Conversion rate** — sale chốt được tỉ lệ cao cho dự án này
4. **Online status** — sale đang online (push notification kịp)
5. **Project expertise** — sale đã chốt nhiều ở `primaryProject`
6. **Geographic match** — sale ở cùng tỉnh dự án
7. **Round-robin tiebreak**

### Allocation flow
```
1. Lead mới vào hệ thống (từ noxh.net hoặc admin tạo)
2. AI Allocator tính score cho từng sale online
3. Gửi push tới top-1 sale: "Bạn có lead mới [Tên + dự án]. Accept trong 60s?"
4. Sale accept → lead.assignedTo = sale, status = NEW
5. Sale decline / timeout → fallback top-2 → ... → admin manual assign
6. Track acceptance rate per sale → feedback vào criteria #2
```

### Schema bổ sung
```graphql
type LeadAllocationOffer {
  id: ID!
  leadId: ID!
  offeredTo: User!
  offeredAt: DateTime!
  expiresAt: DateTime!     # mặc định 60s
  status: OfferStatus!     # PENDING | ACCEPTED | DECLINED | EXPIRED
  responseAt: DateTime
}

enum OfferStatus { PENDING ACCEPTED DECLINED EXPIRED }

mutation RespondLeadOffer($offerId: ID!, $accept: Boolean!) {
  respondLeadOffer(offerId: $offerId, accept: $accept) {
    offer { ...LeadAllocationOffer }
    lead { ...LeadFull }     # nếu accept thì trả lead full
  }
}

subscription LeadOfferIncoming { leadOfferIncoming { offer { ...LeadAllocationOffer } } }
```

**Câu hỏi user (low priority):**
- Timeout offer: 60s đủ không?
- Số lần fallback tối đa? (top-1 → top-2 → top-3 → admin?)
- Sale decline có bị penalty (giảm score)?
- Sale có thể "tạm tắt nhận lead" (giống Grab driver tắt app) không?

## 6. NOXH integration

Lead source = `NOXH_PLATFORM` → có sẵn:
- eKYC verified (CCCD)
- Hộ khẩu/tạm trú province
- Profile basic (tên, SĐT đã verify)

→ App K-Agent gọi sang noxh.net API (Directus REST) hoặc qua CRM proxy để fetch `NoxhProfile`. Sale không phải nhập lại data.

**Ghi chú:** noxh.net dùng Directus REST + snake_case. K-Agent CRM nếu là service riêng (GraphQL như giả định ban đầu) thì cần proxy gọi sang Directus. **Cần Tech Lead xác nhận:** K-Agent dùng cùng Directus với noxh hay GraphQL CRM riêng?
