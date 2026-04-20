# DESIGN.md — K-Agent Mobile Design System

> **Version:** v0.5 — Claude Sienna × Obsidian. Brand shift từ bronze amber → sienna warm + obsidian dark anchor cho high-class contrast. OneHub pattern (hero card, quick action, pipeline bar, action chip) đã apply vào Home + LeadCard.
> **Source of truth:** brand sienna `palette.sienna[500]` (#C8603C) cho identity. Dark anchor `palette.obsidian[700]` (#1C1714) cho hero bg. 3 gradients: `heroDark` (obsidian stats bg), `heroBrand` (sienna immersive), `statCard` (obsidian → sienna warm accent). Urgency crimson `palette.red[600]` (#D32F33) decoupled.
> **Last updated:** 2026-04-20

## 0. Color usage rules (60-30-10) — đọc TRƯỚC mọi quyết định

| Tỉ lệ | Vai trò | Token | Áp dụng |
|-------|---------|-------|---------|
| **60%** | Neutral surface | `surface.background/card/nav` (white), `surface.alt` (slate-50), `surface.hover` (slate-100) | Background, card, nav bar, sticky header, divider |
| **30%** | Structural / typography | `text.primary/secondary/tertiary` (slate-900/500/400), `surface.dark` (slate-900) | Heading, body, dark fills, border |
| **10%** | Brand accent + Urgency | `action.primary` (amber-900 bronze) **+** `urgency.fg` (red-600) | Identity vs Urgency — 2 màu accent đóng vai khác nhau |

### Brand sienna `palette.sienna[500]` (#C8603C) CHỈ dùng cho IDENTITY:
1. **Logo** + app icon → solid sienna
2. **1 primary CTA per screen** ("Đăng nhập", "+ Thêm hoạt động") → **gradient 2-stop sienna[500]→sienna[700]** (xem §2.4)
3. **LeadOfferModal background** + **Login background** → **gradient 4-stop `heroBrand`** (mahogany → sienna → warm glow)
4. **Home hero "Trung tâm điều khiển" bg** → **gradient 3-stop `statCard`** (obsidian → espresso → sienna accent) — dark anchor, không brand full-bleed
5. **Active tab indicator** + active tab tint → solid sienna
6. **Border focus** (input đang focus) → solid sienna
7. **Lead avatar initials bg** + **quick-action icon bg** → `sienna[50]` soft

### Urgency crimson `palette.red[600]` (#D32F33) CHỈ dùng cho ATTENTION:
1. **NEW status badge** (lead mới chưa xử lý)
2. **Notification dot** (chưa đọc / unread)
3. **Overdue indicator** (follow-up quá hạn)
4. **Destructive action** (Đăng xuất, Xóa)

**Lý do tách:** sienna = warm, luxury earth tone, "K-Agent identity". Crimson = "cần action ngay". Trộn 2 vai trò vào 1 màu (cam cũ) → eye strain + ambiguous. Học từ OneHub: blue brand riêng, red "Ưu tiên" riêng. K-Agent: sienna brand + crimson urgency, dark obsidian anchor cho depth.

### KHÔNG dùng brand sienna / urgency crimson cho:
- Tab bar background (white)
- Section background nhấn (slate-50)
- Filter chip active (slate-900 dark fill)
- Card press state (slate-100)
- Stats hero background (slate-900)
- Nhiều CTA cùng screen (chỉ 1 sienna CTA, còn lại secondary outline hoặc ghost)
- Status badges khác NEW (xem §2.3)

## 1. Brand essence

K-Agent = công cụ làm việc cho sale BĐS NOXH. Tone: **Claude sienna × Obsidian**, high-class, warm but serious. Không cute, không playful, không flat. Sienna gợi **đất nung Việt + burnt sienna luxury (Claude.ai DNA)**; obsidian gợi **kim loại đen, đá cao cấp, đáng tin cậy**. Contrast sienna-on-obsidian = signature đẳng cấp cho BĐS.

**4 từ khóa:**
1. **Đẳng cấp** — sienna gradient trên obsidian anchor, depth + warm-dark contrast
2. **Khẩn trương** — lead mới + notification dùng crimson riêng (decoupled khỏi brand)
3. **Rõ ràng** — status, ownership, next action không ambiguous
4. **Việt Nam** — typography Be Vietnam Pro, currency, ngày tháng bản địa

**Inspiration:** OneHub (super-agent BĐS) — clean white surface, dark hero card với gradient, quick action 4-icon row, pipeline progress bar multi-segment, action chip theo semantic (đỏ Ưu tiên, xanh Đề nghị mua, tím Giao dịch), match score, floating confirmation card. Học **cấu trúc + gradient discipline** — KHÔNG copy màu blue (mình dùng sienna).

## 2. Color

> **Source of truth:** `src/theme/tokens.ts` (tier 1 raw palette) + `src/theme/semantic.ts` (tier 2 alias). Mọi giá trị hex literal CHỈ ở `tokens.ts`. Component dùng `semantic.*`, KHÔNG hex hardcode.

### 2.1 Two-tier system

- **Tier 1 — `palette`** (`tokens.ts`): raw scales `slate.50..900`, `obsidian.50..950` (dark anchor warm), `sienna.50..950` (brand), `blue/emerald/green/red/sky/violet` cho status + action chip. Không semantic.
- **Tier 2 — `semantic`** (`semantic.ts`): alias theo use case — `surface`, `text`, `border`, `action`, `status`, `urgency`, `leadGroup`, `actionChip`, `gradient`. Reference palette by name.

### 2.2 Use rules

- **Brand sienna** (`action.primary` = sienna-500, `primaryDeep` = sienna-700): identity — logo, 1 primary CTA per screen, LeadOffer bg, active tab, avatar initials, quick-action icon bg. Xem §0.
- **Obsidian dark anchor** (`surface.dark` = obsidian-700, `surface.darkAccent` = obsidian-500, `surface.darkDeep` = obsidian-900): hero card bg, stats dashboard, dark modal overlay. Warm coffee-black, không slate blue-black.
- **Urgency crimson** (`urgency.fg/bg/dot` = red-600/50/500): attention — NEW lead, notification unread, overdue, destructive action. **Decoupled khỏi brand.**
- **Surface neutral** (`surface.background/card/nav` = white, `surface.alt/hover` = slate-50/100): nền light side 60%.
- **Text** (`text.primary` = obsidian-900, `text.secondary` = obsidian-400, `text.tertiary` = obsidian-300, `text.onDark` = obsidian-50 cream): hierarchy bằng color + weight.
- **Status semantic** (`status.success/warning/error/info`): badge / inline alert / form validation. `warning` = sienna-600 (warm) thay vì amber để consistency brand.
- **Lead group** (`leadGroup.new/engaged/midfunnel/closing/won/ended`): map từ 11 LeadStatus → 6 visual group. `new` dùng `urgency` crimson (xem §2.3). `midfunnel` dùng sienna soft (thay amber cũ).
- **Action chip** (`actionChip.priority/offer/deal/network`): OneHub-style task chip — Ưu tiên red, Đề nghị xem nhà green, Giao dịch violet, Mạng lưới blue. Dùng trong LeadCard + task list.

### 2.3 Lead status grouping

11 LeadStatus gộp thành 6 visual group (`StatusGroup`). Logic: **cam = chỉ NEW (urgency)**, còn lại theo lifecycle stage (engaged → midfunnel → closing → won/ended).

| Group | Status thuộc nhóm | Visual ý nghĩa |
|-------|-------------------|----------------|
| `new` | NEW | **Red** — urgency, cần action ngay (dùng urgency token, không brand) |
| `engaged` | CONTACTED, INTERESTED | Blue — đang trao đổi |
| `midfunnel` | APPOINTMENT, VISITED, NEGOTIATING | Amber — sâu hơn, in-person stage |
| `closing` | DEPOSITED, CONTRACTED | Emerald soft — sắp won |
| `won` | CLOSED_WON | Emerald solid — thành công |
| `ended` | CLOSED_LOST, ON_HOLD | Slate neutral — kết thúc/tạm dừng |

Mapping ở `src/types/lead.ts` (`statusToGroup`). Color tokens ở `semantic.leadGroup`. **Phân biệt status nội bộ group bằng LABEL** (`statusLabels` ở cùng file), KHÔNG bằng màu.

### 2.4 Gradients (v0.5 expanded)

> **Source of truth:** `semantic.gradient.{heroDark,heroBrand,cta,ctaDark,statCard}` ở `src/theme/semantic.ts`. Render qua `<LinearGradient>` từ `expo-linear-gradient`.

| Token | Stops | Direction | Use case |
|-------|-------|-----------|----------|
| `gradient.heroBrand` | 4-stop: `sienna.900 → sienna.700 → sienna.500 → sienna.400` (obsidian sienna → mahogany → sienna → warm glow) | Diagonal `(0,0) → (1,1)` | LeadOfferModal full bg, Login full bg, splash, premium CTA strip. Moment immersive/wow |
| `gradient.heroDark` | 3-stop: `obsidian.900 → obsidian.700 → obsidian.500` (ink → charcoal → espresso) | Diagonal | Alt hero cho dark-first screens (future: stats dashboard standalone) |
| `gradient.statCardSoft` | 2-stop: `sienna.50 → white` (warm tint → white) | Diagonal `(0,0) → (1,1)` | **"Trung tâm điều khiển" card bg** — light warm tint cho clean feel, stats number tự nổi bật bằng tone color. Home hero stats. |
| `gradient.cta` | 2-stop: `sienna.500 → sienna.700` (subtle top→bottom) | Vertical `(0,0) → (0,1)` | Primary `<Button>` bg. Depth touch, không chói. Auto-applied khi `variant="primary"` |
| `gradient.ctaDark` | 2-stop: `obsidian.700 → obsidian.900` | Vertical | Future `<Button variant="dark">` depth |

**Rules:**
- **heroBrand** chỉ dùng cho moment quan trọng — tối đa 2-3 screen (Login + LeadOffer + Home CTA strip). KHÔNG full-bleed ở tab content thường.
- **statCardSoft** dùng cho 1 hero card per tab (Home "Trung tâm điều khiển"). Light warm tint giữ nền clean, để stats number (sienna/crimson/emerald) tự nổi. Không dùng dark gradient cho tab content — chỉ Login/LeadOffer mới full-dark immersive.
- **CTA gradient** áp dụng tự động ở `<Button variant="primary">`. Không thêm gradient khác cho button (consistency).
- Card / list item thường dùng solid white bg — **dark gradient card là accent**, không default.
- KHÔNG tạo gradient mới ngoài 5 token này — nếu thấy cần, hỏi user trước.

### 2.5 Dark mode

**Defer phase MVP.** Nền tảng đã có obsidian palette sẵn sàng cho dark theme: surface flip sang `obsidian.900/700`, text dùng `obsidian.50` cream (đã alias `text.onDark`), sienna vẫn làm brand accent (saturation giữ nguyên — sienna-500 contrast tốt trên obsidian). Sẽ add scheme token mới ở `semantic.ts` thay vì redefine.

## 3. Typography

### 3.1 Font choice (mobile-adapted)
**Be Vietnam Pro** — font Việt hóa tốt, tối ưu hiển thị tiếng Việt với dấu, all-purpose UI.

4 weight: 400 Regular / 500 Medium / 600 SemiBold / 700 Bold (~140KB total). Loaded via `@expo-google-fonts/be-vietnam-pro` ở `app/_layout.tsx`. Fallback system: `SF Pro` (iOS) / `Roboto` (Android).

### 3.2 Type variants

> **Source of truth:** `src/theme/typography.ts` (object `typography: Record<TextVariant, VariantStyle>`). Component KHÔNG redefine — luôn dùng `<Text variant="...">` từ `@/components/ui/Text`.

| Variant | Use case |
|---------|----------|
| `display` | Hero stat number (Home stats, LeadOffer countdown) |
| `h1` | Screen title (login, forgot-password, "Đặt mật khẩu mới") |
| `h2` | Section title (tab header, lead detail name) |
| `h3` | Card title, list item primary, sub-section title (LeadCard name, Me menu, Chat conversation title) |
| `body-lg` | **DEFAULT** body, settings menu item, modal body |
| `body` | Secondary body, input value, list item secondary, button text in cards |
| `caption` | Metadata, timestamp, helper text, input label, stat label |
| `badge` | UPPERCASE status badge, eyebrow tag |
| `button` | Button label inside `<Button>` component |

Quy ước: `lineHeight ≥ size × 1.4` cho text có dấu tiếng Việt (đã built-in từng variant).

KHÔNG thêm variant mới ngoài 11 trên — nếu thấy cần case khác, hỏi user trước. Nếu chỉ cần đổi color → dùng `style={{ color }}` hoặc className. Nếu chỉ cần đổi weight → cân nhắc đổi variant.

### 3.3 🚨 CRITICAL — Font size rules (BẮT BUỘC)

**KHÔNG được:**
- ❌ Dùng `fontSize < 12` ở BẤT KỲ ĐÂU
- ❌ Dùng `fontSize 12` cho text đọc bình thường (chỉ cho UPPERCASE badge)
- ❌ Dùng `fontSize 14` làm body default (dùng 16)
- ❌ Giảm fontSize để "fit" content → thay vào đó: truncate, ellipsis, hoặc redesign layout
- ❌ Dùng Tailwind `text-xs` (12px) hoặc nhỏ hơn cho paragraph text
- ❌ Dùng `text-[10px]`, `text-[11px]`, `text-[14px]` arbitrary values

**PHẢI:**
- ✅ Default body: **16px** (`bodyLg` token / `text-body-lg`)
- ✅ Secondary text: **15px** (`body` / `text-body`)
- ✅ Metadata, timestamp, helper: **13px** min (`caption` / `text-caption`)
- ✅ UPPERCASE badge: **12px** (`badge` / `text-badge`) — duy nhất cho phép
- ✅ Line-height tối thiểu `size × 1.4` cho text có dấu tiếng Việt
- ✅ Hierarchy: đổi **weight + color** TRƯỚC, size là phương án cuối
- ✅ Nếu content không fit → **báo user**, không tự giảm size

**Quick lookup khi code:**
| Use case | Variant |
|----------|---------|
| Screen title | `<Text variant="h1">` |
| Section title | `<Text variant="h2">` |
| Card title, list item primary | `<Text variant="h3">` |
| **Body text (default)** | `<Text variant="body-lg">` |
| Secondary body | `<Text variant="body">` |
| Caption, metadata, timestamp, input label, stat label | `<Text variant="caption">` |
| Badge UPPERCASE | `<Text variant="badge">` |
| Button label | dùng `<Button label="...">` (đã encode variant button bên trong) |
| ❌ Anything <12 | FORBIDDEN |

**TextInput riêng:** RN `TextInput` không phải custom Text → import `typography['body-lg']` từ `@/theme` và spread vào `style`. KHÔNG dùng `text-[Npx]` arbitrary.

**Cần emphasis cho caption?** (vd input label cần đậm hơn để stand out): override `style={{ fontFamily: 'BeVietnamPro_500Medium' }}` inline. Đây là escape hatch hiếm — nếu repeat 3+ lần, đề xuất user thêm variant.

## 4. Spacing & Layout

### 4.1 Spacing scale (tailwind-like)
```ts
spacing = { 0:0, 0.5:2, 1:4, 1.5:6, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64, 20:80 }
```

### 4.2 Screen layout rules
- **Safe area:** **BẮT BUỘC** dùng `<Screen>` wrapper từ `@/components/Screen` cho tab/stack screen (thay raw `<SafeAreaView>`) — standardize inset + **conditional breathing**: inset < 24px (web / no-notch simulator) → breathing 16px; inset ≥ 24px (device có notch/Dynamic Island) → breathing 8px. Tránh content dính status bar trên mọi platform. Props: `edges` (default `['top']`), `bg` (`surface`/`alt`/`transparent`, default `surface`), `padded` (default `true`)
- **Khi nào KHÔNG dùng `<Screen>`:** full-bleed gradient screen (Login, LeadOffer) — raw `<SafeAreaView>` trong `<LinearGradient>` để gradient chạm viền
- **Horizontal padding:** mặc định 16px. Section card có thể full-bleed
- **Bottom tab height:** 64px (đồng bộ iOS/Android — hiện đang set 64px ở `_layout.tsx`)
- **Sticky header:** 56px height + safe area top (đã do `<Screen>` handle)
- **Modal:** sheet style, snap points 50%/90%
- **List item min height:** 64px (đủ tap target 44px + padding)

## 5. Border radius
```ts
radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 }
```
Convention:
- Button: `radius.md` (12)
- Card: `radius.lg` (16)
- Badge / chip: `radius.full`
- Avatar: `radius.full`
- Modal sheet: `radius.2xl` (24) top-only
- Input: `radius.md`

## 6. Shadows / Elevation
```ts
shadow: {
  none: {},
  sm:  { offset: {0,1}, blur: 2,  opacity: 0.05 },   // subtle separator
  md:  { offset: {0,4}, blur: 8,  opacity: 0.08 },   // card resting
  lg:  { offset: {0,10}, blur: 20, opacity: 0.10 },  // popover, dropdown
  xl:  { offset: {0,20}, blur: 40, opacity: 0.15 },  // modal sheet
}
```
Android dùng `elevation` prop tương đương.

## 7. Component conventions

### 7.1 Button
Variants: `primary` (filled cam), `secondary` (outline cam), `ghost` (text only), `dark` (filled `buttonDark`), `destructive` (filled red).
Sizes: `sm` (32h), `md` (44h — default), `lg` (52h — full-width CTA).
States: default, pressed (darken 10%), disabled (opacity 0.4), loading (spinner thay text).

### 7.2 Input
- Height 48px
- Border 1px `border.default`, focus → 2px `border.focus` (brand)
- Label trên input (16px gap)
- Error state: border `semantic.error` + helper text dưới
- Phone input: prefix `+84`, mask `xxx xxx xxxx`

### 7.3 LeadCard (component chính, dùng nhiều)
```
┌─────────────────────────────────────────────────────┐
│ ╭──╮  Nguyễn Văn A                       [NEW]     │  ← avatar initials + name + status badge
│ │AN│  📞 0901 234 567                               │
│ ╰──╯  🏢 Sky Garden Q9 · 2PN                        │
│       🕐 Quá hạn 2 tiếng             [Ưu tiên]     │  ← followup time + action chip
└─────────────────────────────────────────────────────┘
```
- **Avatar** sienna-50 bg + initials sienna-700 (warm circle, thay dot status cũ)
- **Border**: overdue → urgency bg red, normal → border.light
- **Action chip** (OneHub pattern) phân loại theo status: NEW → Ưu tiên (red), APPOINTMENT/VISITED → Đề nghị xem nhà (green), NEGOTIATING/DEPOSITED/CONTRACTED → Giao dịch (violet). Khác status → không chip
- **Shadow** `obsidian-900` opacity 0.04 — subtle depth, không flat
- Tap → LeadDetail. Long-press → quick actions (call/sms/zalo) — future.

### 7.4 LeadOfferModal (Grab-style incoming)
- Full-screen modal trên cùng
- Background: gradient `primary → primaryHover`, text trắng
- Lead name + project + 60s countdown ring (animated)
- 2 button bottom: "Từ chối" (ghost trắng) + "NHẬN LEAD" (filled `buttonDark`, full width)
- Vibrate: pattern `[0, 500, 200, 500]`, lặp tới khi user response hoặc timeout
- Sound: chime `assets/sounds/lead-incoming.mp3`

### 7.5 Status badge (group-based)
- Pill shape, `radius.full`
- Padding 4px 10px
- Font `micro` uppercase, weight 600
- Color theo `groupTokens[statusToGroup[STATUS]]`
- Label text vẫn show tên status đầy đủ (Đã liên hệ, Đàm phán, ...) — không phải tên group

### 7.6 HeroStatsCard (OneHub "Trung tâm điều khiển" pattern — v0.5.1)
- Light gradient card dùng `gradient.statCardSoft` (sienna-50 → white, diagonal)
- Border sienna-100 subtle + shadow sienna-700 opacity 0.08 → warm depth, không dark
- Props: `title` (UPPERCASE caption, sienna-700), `subtitle` (obsidian text primary), `stats` (3-4 stat với tone `default|accent|urgent|success`), optional `pipeline` (multi-segment progress bar)
- Pipeline bar: height 2px, track sienna-100 soft, mỗi segment `flex: count`, màu lấy từ `semantic.leadGroup[group].dot`
- Legend dưới bar: dot + label + count cho mỗi segment (text secondary), "Tổng pipeline: N lead" (tertiary)
- Stats row: display number 28px Bold — tone accent=sienna-500, urgent=crimson, success=emerald-600, default=obsidian primary
- **Lý do light thay dark:** dark gradient card trong tab content đè nặng + clash với bottom bar + lead list white. Dark chỉ dùng cho Login/LeadOffer full-bleed immersive.

### 7.7 QuickActionRow + SalesProfileHeader + ActionChip (v0.5)
- **QuickActionRow**: 4 action equal flex, icon 22px trong circle sienna-50 (bg) + sienna-500 (stroke), label caption dưới. Optional badge crimson top-right cho count
- **SalesProfileHeader**: avatar circle initials sienna-700, greeting caption + tier pill (obsidian-700 bg, cream text) + name h3, team caption tertiary. Bell button right với unread badge crimson
- **ActionChip**: pill rounded-full, 4 kind — priority (red), offer (green), deal (violet), network (blue). Font badge UPPERCASE

### 7.8 Bottom Tab Bar (white + indicator-only)
5 tabs với icon + label:
- 🏠 Trang chủ
- 👥 Lead
- 💬 Chat AI
- 🔔 Thông báo (badge count đỏ)
- 👤 Tôi

**Active state (KHÔNG fill cam):**
- Tab bar background: `#ffffff` với top border `border.light` (slate-100)
- Active: icon + label màu `primary` (cam) + **dot indicator 4px cam phía trên icon** (thay cho underline vì bottom tab dùng underline khó nhìn)
- Inactive: icon + label `text.tertiary` (slate-400)
- Không có background tint cho active tab

## 8. Iconography
- **Library:** Lucide (consistent với NOXH web). Dùng `lucide-react-native`.
- **Size:** 16 / 20 / 24 / 32
- **Stroke width:** 2 (mặc định), 1.5 cho size 32+
- **Material Icons** chỉ dùng nếu cần match Directus amenities icons (nhiều icon nhà BĐS specific)

## 9. Motion
- **Duration:** 150ms (instant feedback), 250ms (default), 400ms (hero transitions)
- **Easing:** `Easing.out(Easing.cubic)` cho enter, `Easing.in(Easing.cubic)` cho exit
- **Reduce motion:** respect `AccessibilityInfo.isReduceMotionEnabled()` — disable nonessential
- **Library:** `react-native-reanimated` v3 (đã có trong Expo SDK 52)

## 10. Imagery & assets
- **Logo:** chưa có — placeholder text "K-Agent" weight 700 màu primary cho tới khi designer cấp logo
- **App icon:** placeholder cam trơn với chữ "KA" trắng
- **Splash:** logo center, background trắng
- **Empty state illustrations:** dùng style line illustration, màu primary line, simple

## 11. Accessibility
- **Min tap target:** 44x44 (iOS) / 48x48 (Android)
- **Color contrast:** AA minimum (4.5:1 cho body text, 3:1 cho large text)
- **Dynamic type:** scale theo `PixelRatio.getFontScale()`, max scale 1.5
- **Screen reader:** `accessibilityLabel`, `accessibilityRole` cho mọi interactive
- **Focus order:** top-to-bottom, left-to-right

## 12. Localization
- **Primary:** vi (mặc định)
- **Secondary:** chưa
- **Number format:** `1.234.567 ₫` (dot separator, ₫ suffix)
- **Date:** `19/04/2026` hoặc relative ("2 tiếng trước", "hôm qua")
- **Library:** `i18n-js` + `expo-localization`

## 13. Tailwind / NativeWind config (xem `tailwind.config.js` source of truth)

Tóm tắt token chính:
- `primary` / `primary-hover` / `primary-soft` / `primary-deep` — sienna brand 500/600/50/700
- `surface-dark` / `surface-dark-accent` / `surface-dark-deep` — obsidian 700/500/900 (warm coffee-black)
- `text-on-dark` / `text-on-dark-soft` — obsidian 50 cream cho text trên dark bg
- `sienna-{50..950}` + `obsidian-{50..950}` — raw scales khi cần shade chính xác
- `urgency` / `urgency-bg` / `urgency-dot` — crimson decoupled brand
- `violet-{600,700}` — action chip "Giao dịch"
- `lead.{new,engaged,midfunnel,closing,won,ended}` — 6 group status (midfunnel đã swap sang sienna-50/700)

## 14. Open design questions
1. **Logo K-Agent** — cần designer hoặc tự generate. Tôi gợi ý: chữ K stylized + arrow up (sale = up). Có thể commission Fiverr / dùng Looka.
2. **App icon** — tương tự, cần thiết kế. Adaptive icon Android cần 2 layer (foreground + background).
3. **Splash screen animation** — tĩnh hay có motion (fade in logo)?
4. **Onboarding illustrations** — 3 màn cần 3 illustration. Buy stock hay custom?
5. **Sound effects** — lead incoming chime: tự record, dùng free library (Pixabay), hay mua?
6. **Cam có quá rực?** — `#f3350c` rất "loud". Cân nhắc trên dark UI (modal, stats bg) chuyển sang gradient mềm hơn.
