# Tech Stack K-Agent — Full Audit

_Last updated: 2026-04-24_

## 1. Core Framework & Language

| Stack | Phiên bản | Mục đích | Chi phí |
|---|---|---|---|
| **React Native** | 0.81.5 | Cross-platform mobile runtime | Free |
| **React** | 19.1.0 | UI library với React Compiler auto-memo | Free |
| **Expo SDK** | 54.0.33 | Managed toolchain + modules wrapper | Free (OSS) |
| **TypeScript** | 5.9.2 | Type safety, catch bugs compile-time | Free |
| **Hermes** | Built-in | JS engine tối ưu RAM + startup time iOS/Android | Free |

## 2. Routing & Navigation

| Stack | Mục đích | Chi phí |
|---|---|---|
| **Expo Router 6** | File-based routing (Next.js-style), deep linking, type-safe pathname | Free |
| **React Navigation 7** | Navigation primitives (Stack, Tabs) | Free |
| **react-native-screens** | Native screen optimization | Free |

## 3. State Management & Data

| Stack | Mục đích | Chi phí |
|---|---|---|
| **Zustand 5** | Global state (auth, leads, bookings, etc.) — nhẹ, không boilerplate | Free |
| **React Hook Form** | Form state management (chưa tích hợp hết, mới ở form phức tạp) | Free |
| **Zod** | Runtime schema validation | Free |
| **Apollo Client 3** + **graphql** | GraphQL client (setup sẵn, chưa wire BE) | Free |
| **apollo3-cache-persist** | Cache Apollo vào storage | Free |
| **react-native-mmkv** | High-performance persistent storage (key-value) | Free (OSS) |
| **expo-secure-store** | Keychain cho credentials | Free |

## 4. UI, Styling & Design

| Stack | Mục đích | Chi phí |
|---|---|---|
| **NativeWind 4** + **TailwindCSS 3.4** | Tailwind-in-RN, style via className | Free |
| **lucide-react-native** | Icon library (tree-shakeable, 1000+ icons) | Free |
| **@expo/vector-icons** | Icon fallback | Free |
| **expo-linear-gradient** | Gradient backgrounds | Free |
| **react-native-svg** | SVG rendering (logo, pattern, charts) | Free |
| **BeVietnamPro** (Google Fonts) | Font tiếng Việt chuẩn | Free |
| **Lexend** (Google Fonts) | Fallback font | Free |

## 5. Animation & Interaction

| Stack | Mục đích | Chi phí |
|---|---|---|
| **react-native-reanimated 4** + **react-native-worklets** | 60fps animations trên UI thread (bottom sheet, pulse, layout) | Free |
| **react-native-gesture-handler** | Native gesture (swipe, pan) | Free |
| **@react-native-community/slider** | Native slider (loan calc) | Free |
| **expo-haptics** | Rung tactile feedback | Free |

## 6. Native Device Capabilities

| Stack | Mục đích | Chi phí |
|---|---|---|
| **expo-audio** | Voice recording (task voice, lead voice) | Free |
| **expo-camera** | CCCD scanner | Free |
| **expo-local-authentication** | Face ID / Touch ID / Biometric | Free |
| **expo-notifications** | Push notifications (OS-level) | Free (cần FCM/APNs setup) |
| **expo-image** | Performant image với memory-disk cache | Free |
| **expo-file-system** | File I/O (audio → base64 upload) | Free |
| **expo-linking** | Deep links + mailto/tel/sms/zalo | Free |
| **expo-web-browser** | In-app browser (policy, terms) | Free |
| **@react-native-community/netinfo** | Online/offline detection | Free |
| **react-native-webview** | YouTube iframe embed (project gallery) | Free |

## 7. AI / External APIs

| Service | Mục đích | Chi phí |
|---|---|---|
| **Gemini 3 Flash** (Google AI) | Voice lead extraction (complex prompt + structured JSON) | **$0.30 / 1M input · $2.50 / 1M output tokens**. Audio input ~32 tokens/sec → 1 phút audio ~1900 tokens. Ước tính **~0.002 USD / voice lead** |
| **Gemini 2.5 Flash Lite** | Voice task extraction (light, fast) | **$0.10 / 1M input · $0.40 / 1M output** — ~**0.0005 USD / task** |
| **Free tier Google AI**: 15 req/min + 1500 req/day | Dev + demo | $0 |
| **Gemini API key setup** | Dashboard console.cloud.google.com | Free signup |

**Ước tính production**: 10 sale × 20 voice/ngày × 30 ngày = 6000 calls/tháng → **~3-12 USD/tháng** (tùy model mix).

## 8. Distribution & Build

| Service | Mục đích | Chi phí |
|---|---|---|
| **Apple Developer Program** | Distribute iOS app (TestFlight, App Store) | **$99 / năm** |
| **Google Play Console** | Distribute Android | **$25 one-time** |
| **Expo EAS Build** | Cloud build iOS + Android (IPA/APK/AAB) | **Free** 30 builds/mo · **Production $19/mo** hoặc pay-per-build (~$1/build) |
| **Expo EAS Submit** | Tự động submit lên stores | Free với EAS plan |
| **Expo EAS Update** | OTA hot update (bypass app store) | Free < 1000 MAU · **$99/mo cho ≤ 200k MAU** |

## 9. Infrastructure (sẽ cần khi scale)

| Service | Mục đích | Chi phí ước tính |
|---|---|---|
| **Backend API** (chưa implement) | Apollo GraphQL BE host — AWS/Vercel/Railway | **$20-100/mo** tùy provider + DB |
| **Database** (PostgreSQL hoặc MongoDB) | Lưu leads/bookings/users | **$7-25/mo** managed (Neon, Supabase, MongoDB Atlas) |
| **CDN** cho images | Cloudflare R2 / Bunny / Cloudinary | **$5-20/mo** |
| **Push server** | FCM (Google) + APNs (Apple) | **Free** (unlimited) |
| **Monitoring / Crash reporting** | Sentry hoặc Bugsnag | **Free < 5k events** · **$26/mo** cho team |
| **Analytics** | PostHog / Mixpanel / Firebase Analytics | **Free < 10k events** |

## 10. Dev tools (miễn phí, bundled)

- **ESLint 9** + **eslint-config-expo** — linting
- **@expo/ngrok** — tunnel cho wifi restricted
- **date-fns 4** — date utilities
- **@hookform/resolvers** — zod bridge

---

## 📊 Tổng chi phí hiện tại / tháng

| Phase | Chi phí |
|---|---|
| **Dev-only** (như hiện tại) | **$0** (free tiers Gemini + GitHub + local Expo) |
| **Soft launch 10 sale, voice active** | ~**$15/tháng** (Gemini + EAS build nhẹ) |
| **Production 100 sale, BE ready** | ~**$200-400/tháng** (Gemini + BE + CDN + monitoring + EAS) |
| **Scale 1000+ sale** | ~**$1-3k/tháng** (BE nặng + Gemini volume + analytics) |

## 💰 One-time

- **Apple Developer**: $99 (recurring mỗi năm)
- **Google Play**: $25 (một lần trọn đời)

---

## Đánh giá stack

**Điểm mạnh**:
- Managed (Expo) → không đụng native code, build nhanh
- React 19 + Compiler → auto-memo, ít phải tối ưu thủ công
- Zustand + MMKV → perf state lightweight
- NativeWind → styling đồng bộ cross-platform
- Free tier các service đủ dùng cho đến khi production

**Điểm yếu / rủi ro**:
- **Gemini lock-in**: chuyển OpenAI/Claude sẽ phải rewrite prompt + API
- **Chưa có BE**: app 100% mock → ship production phải làm BE trước
- **No error monitoring**: crash production không track được → cần Sentry
- **No analytics**: không biết user behavior → cần PostHog/Mixpanel
