# Screens & Navigation — K-Agent Mobile

> **Status:** v0.1 — đề xuất, cần user duyệt trước khi mockup
> **Goal:** Đầy đủ screen + navigation tree để build skeleton Expo Router

## 1. Navigation tree

```
(auth) — chưa đăng nhập
  /login                       — SĐT + password
  /forgot-password             — nhập SĐT
  /verify-otp                  — nhập OTP 6 số
  /reset-password              — đặt mật khẩu mới
  /onboarding                  — 3 slides giới thiệu (chỉ lần đầu)

(app) — đã đăng nhập, tab navigation 5 tab dưới
  /                            — Tab 1: Home (dashboard sale)
  /leads                       — Tab 2: Leads (danh sách lead)
    /leads/[id]                — chi tiết lead
    /leads/[id]/activities/new — tạo activity (call/sms/note)
    /leads/[id]/edit           — sửa lead
    /leads/new                 — tạo lead manual (ít dùng vì AI allocation)
  /chat                        — Tab 3: AI Chat (RAG bot)
    /chat/[conversationId]
  /notifications               — Tab 4: Thông báo
  /me                          — Tab 5: Tôi (profile + settings)
    /me/profile                — sửa profile
    /me/settings               — settings (biometric, notification, theme)
    /me/sync-status            — pending mutations, conflicts
    /me/about                  — version, ToS, privacy

(modal) — present as sheet/modal
  /lead-offer/[offerId]        — popup khi nhận lead allocation (kiểu Grab incoming ride)
  /scanner                     — QR scanner (scan CCCD/QR khách)
  /image-viewer                — fullscreen image
```

## 2. Screen inventory chi tiết (28 screens)

### Auth (5 screens)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 1 | Login | SĐT + password | PhoneInput, PasswordInput, biometric quick-login button |
| 2 | ForgotPassword | nhập SĐT để gửi OTP | PhoneInput |
| 3 | VerifyOTP | nhập 6 số OTP | OTPInput, resend countdown 60s |
| 4 | ResetPassword | password mới + confirm | PasswordInput x2, strength meter |
| 5 | Onboarding | 3 slides (lần đầu) | swiper, dot indicator, skip button |

### Home dashboard (1 screen)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 6 | Home | Dashboard sale hôm nay | Greeting, stats card (lead mới, follow-up hôm nay, đã chốt tháng), pending offer banner, today's followup list, online toggle |

### Leads (5 screens)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 7 | LeadsList | Danh sách lead của tôi | SearchBar, FilterChips (status, project, followup), LeadCard list, fab "+ tạo lead" |
| 8 | LeadDetail | Chi tiết lead | Header (name, phone, status badge), tabs: Info / Activities / Documents, action bar (call/sms/zalo/changeStatus) |
| 9 | LeadEdit | Sửa info lead | form (name, project, alternative projects, unit type, notes, customFields NOXH) |
| 10 | LeadCreate | Tạo lead manual | giống edit nhưng minimal fields |
| 11 | ActivityCreate | Ghi nhận hoạt động | form (type, content, outcome, scheduledAt, attachments) |

### AI Chat (2 screens)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 12 | ChatList | Conversations | search, list conversations, fab "+ chat mới" |
| 13 | ChatDetail | SSE chat | message bubbles, source citations, input bar, voice input (defer) |

### Notifications (1 screen)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 14 | NotificationsList | Push log | tabs: All / Unread, list grouped by date |

### Me/Settings (5 screens)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 15 | MeHome | Profile summary | avatar, name, phone, role, stats, menu items |
| 16 | EditProfile | Sửa avatar/name | form |
| 17 | Settings | Toggles | biometric login, push notification, theme (light/dark), language |
| 18 | SyncStatus | Pending mutations | list pending/failed/conflict mutations, retry button |
| 19 | About | App info | version, EAS update channel, ToS, Privacy, logout |

### Modal/Sheet (3 screens)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 20 | LeadOfferModal | "Bạn có lead mới — accept 60s?" | Lead summary, project, countdown timer, accept/decline buttons. Vibrate + sound như Grab |
| 21 | Scanner | Quét CCCD/QR | camera viewfinder, scan result preview |
| 22 | ImageViewer | Fullscreen ảnh | pinch-zoom, swipe between images |

### Utility (3 screens)
| # | Screen | Purpose | Key components |
|---|--------|---------|----------------|
| 23 | Splash | Loading initial | logo, version |
| 24 | ForceUpdate | Block khi version < min | message, "Cập nhật ngay" → store link |
| 25 | OfflineBanner | banner persistent khi offline | (component, không phải screen) |
| 26 | EmptyState | reusable empty state | (component) |
| 27 | ErrorBoundary | crash fallback | (component) |
| 28 | Maintenance | BE maintenance mode | message, retry button |

## 3. Key user journeys

### J1 — Sale nhận lead mới (HAPPY PATH)
```
Sale online (Home, online toggle ON)
  → Lead mới vào hệ thống (từ noxh.net)
  → AI Allocator pick sale này (top score)
  → Push notification + LeadOfferModal popup (60s countdown, vibrate)
  → Sale tap "Nhận"
  → Lead được assign, modal close
  → Auto-redirect tới LeadDetail, status = NEW
  → Sale gọi điện ngay từ ActionBar (deeplink tel:)
  → Quay lại app, tạo Activity (CALL, outcome=REACHED, content="khách hỏi giá tầng 10")
  → Đổi status NEW → CONTACTED
```

### J2 — Sale chăm lead theo schedule
```
Home → "Hôm nay có 8 lead cần follow up" → tap
  → LeadsList filter hasFollowupBefore=today
  → Tap lead → LeadDetail
  → Action: Call/SMS/Zalo deeplink
  → Tạo Activity, đặt nextFollowupAt = +3 ngày
  → Back → tiếp lead khác
```

### J3 — Sale offline tạo activity tại showroom
```
Sale đến showroom (không có sóng)
  → LeadsList (cache hit) → tap lead → LeadDetail (cache hit)
  → Tạo Activity (MEETING) + ảnh nhà mẫu
  → Optimistic UI: activity hiển thị ngay với badge "đang đợi sync"
  → Mutation queue persist MMKV
  → Sale rời showroom → có sóng → auto sync → badge biến mất
```

### J4 — Conflict khi 2 device cùng update
```
Sale dùng iPad ở văn phòng đổi status CONTRACTED
Sau đó offline mở app trên iPhone, đổi status NEGOTIATING (đã sai)
Online → mutation lên BE → BE return conflict
  → SyncStatus screen badge đỏ
  → User tap → Conflict UI: "Bạn: NEGOTIATING vs Server: CONTRACTED"
  → Chọn "Lấy server" → resolve
```

### J5 — Sale chat AI hỏi về dự án
```
Tab Chat → "+ chat mới" → ChatDetail
  → Type: "Dự án Sky Garden Quận 9 còn căn 2PN nào dưới 2 tỷ?"
  → SSE streaming response (RAG từ knowledge base K-CITY)
  → Trả lời + source citations (tap → mở PDF)
```

### J6 — Sale forgot password
```
Login → "Quên mật khẩu?" → ForgotPassword
  → Nhập SĐT → "Gửi OTP"
  → VerifyOTP → nhập 6 số
  → ResetPassword → đặt mật khẩu mới
  → Auto login → Home
```

## 4. Empty states & edge cases

| Screen | Empty state |
|--------|-------------|
| LeadsList | "Bạn chưa có lead nào. Bật toggle online để nhận lead." |
| Activities (trong LeadDetail) | "Chưa có hoạt động. Bắt đầu gọi điện cho khách." |
| Notifications | "Chưa có thông báo." |
| ChatList | "Hỏi AI về dự án, sản phẩm, khách hàng." |
| SyncStatus | "Tất cả thay đổi đã sync." (hoặc list pending) |

## 5. Open questions

1. **Stats dashboard**: cần stats gì cho sale? (lead mới/tuần, follow-up due, đã chốt tháng, conversion rate?)
2. **Online toggle**: vị trí? Home top hay Settings? Mặc định ON sau login hay OFF?
3. **Scanner**: scan QR gì? CCCD chip? Mã khách hàng noxh.net? — Có thể defer
4. **Notification grouping**: theo ngày, theo lead, hay flat?
5. **Theme dark mode**: cần MVP hay defer?
6. **Multi-language**: chỉ vi MVP, sau này thêm en?
