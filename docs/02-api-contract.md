# API Contract — K-Agent ↔ Backend

> **Status:** v0.2 — đã sync user answers, chờ Tech Lead BE review (defer — phase mockup trước)
> **Audience:** Tech Lead backend K-CITY
> **Goal:** Liệt kê **toàn bộ** operation mà mobile app cần.

## Changes v0.1 → v0.2 (2026-04-19)
- Bỏ team leader operations (defer phase sau, MVP chỉ 1 sàn 1 sale role)
- Thêm **AI Lead Allocation**: `respondLeadOffer` mutation, `leadOfferIncoming` subscription (xem `01-lead-model.md` §5)
- Thêm **Reset password flow**: SĐT → OTP → mật khẩu mới
- Thêm **NOXH integration**: profile fetch từ noxh.net (Directus REST) hoặc qua CRM proxy
- **Open question lớn:** K-Agent dùng cùng Directus với noxh hay GraphQL CRM riêng? — cần Tech Lead xác nhận
- Schema bỏ field `budget`, đơn giản hóa `projectInterests` → `primaryProject + alternativeProjects`

## 0. Scope summary

App K-Agent cần các nhóm operation:
1. **Auth** — login SĐT/password + refresh token + device register
2. **Lead** — list/detail/create/update/assign + activity log
3. **Reference data** — projects, units, users, teams
4. **Notifications** — register device, list, mark read
5. **Chat AI** — SSE streaming endpoint (REST, không phải GraphQL)
6. **Sync** — subscriptions để realtime, cursor pagination, version gate
7. **File upload** — ảnh activity, CCCD scan (nếu có)

## 1. Auth

### 1.1 Login
```graphql
mutation Login($phone: String!, $password: String!, $deviceInfo: DeviceInfoInput!) {
  login(phone: $phone, password: $password, deviceInfo: $deviceInfo) {
    accessToken      # JWT, TTL ngắn (15 phút)
    refreshToken     # opaque, TTL dài (30 ngày), rotate mỗi lần refresh
    expiresAt
    user { id fullName phone role team { id name } }
  }
}

input DeviceInfoInput {
  deviceId: String!      # UUID generated bởi app, persist trong SecureStore
  platform: String!      # "ios" | "android"
  osVersion: String!
  appVersion: String!
  pushToken: String      # Expo push token, có thể null nếu user chưa cấp permission
}
```

**BE cần build:**
- [ ] `login` mutation với `DeviceInfoInput` (hiện có chưa?)
- [ ] Refresh token rotation (mỗi lần `refreshToken` được dùng → revoke cái cũ, cấp cái mới)
- [ ] Bảng `devices` để track multi-device login + revoke per-device

### 1.2 Refresh
```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken     # MỚI — rotate
    expiresAt
  }
}
```

### 1.3 Logout
```graphql
mutation Logout($deviceId: String!) {
  logout(deviceId: $deviceId) { success }
}
```

### 1.4 Reset password (in scope MVP)
```graphql
mutation RequestPasswordResetOtp($phone: String!) {
  requestPasswordResetOtp(phone: $phone) {
    otpId           # opaque, dùng cho verifyOtp
    expiresAt       # OTP TTL (5 phút)
    cooldownSeconds # min thời gian giữa 2 lần request (60s)
  }
}

mutation VerifyOtp($otpId: String!, $code: String!) {
  verifyOtp(otpId: $otpId, code: $code) {
    resetToken      # opaque, dùng cho resetPassword (TTL 10 phút)
  }
}

mutation ResetPassword($resetToken: String!, $newPassword: String!) {
  resetPassword(resetToken: $resetToken, newPassword: $newPassword) {
    success
  }
}
```
**BE cần:** SMS gateway (eSMS / Vihat / FPT?), rate limit per phone (3 OTP/giờ).

## 2. Lead

### 2.1 List leads (cursor pagination)
```graphql
query Leads(
  $filter: LeadFilter
  $sort: LeadSort = UPDATED_AT_DESC
  $first: Int = 20
  $after: String
) {
  leads(filter: $filter, sort: $sort, first: $first, after: $after) {
    edges {
      cursor
      node { ...LeadCard }
    }
    pageInfo { hasNextPage endCursor }
    totalCount
  }
}

input LeadFilter {
  status: [LeadStatus!]
  assignedTo: [ID!]            # null = chỉ lead của tôi; [ID] = team leader xem
  projectIds: [ID!]
  source: [LeadSource!]
  createdFrom: DateTime
  createdTo: DateTime
  search: String               # search theo SĐT/tên
  hasFollowupBefore: DateTime  # chăm sóc quá hạn
  updatedAfter: DateTime       # delta sync
}

enum LeadSort {
  UPDATED_AT_DESC
  CREATED_AT_DESC
  NEXT_FOLLOWUP_ASC
  STATUS_PRIORITY
}

fragment LeadCard on Lead {
  id phone fullName status source nextFollowupAt updatedAt
  assignedTo { id fullName }
  projectInterests { id name }
}
```

**BE cần:**
- [ ] Cursor pagination (Relay-style hoặc opaque cursor)
- [ ] Filter `updatedAfter` để mobile làm delta sync
- [ ] Index trên `(assigned_to, updated_at)`, `(status, next_followup_at)` cho performance
- [ ] Trả `totalCount` (cho UI "245 leads")

### 2.2 Lead detail
```graphql
query Lead($id: ID!) {
  lead(id: $id) {
    ...LeadCard
    budget { min max currency }
    unitTypeInterests
    notes
    customFields
    expiresAt
    activities(first: 50) {
      edges { node { ...ActivityFull } }
      pageInfo { hasNextPage endCursor }
    }
    createdBy { id fullName }
    createdAt
  }
}
```

### 2.3 Create lead (offline-capable)
```graphql
mutation CreateLead($input: CreateLeadInput!, $idempotencyKey: String!) {
  createLead(input: $input, idempotencyKey: $idempotencyKey) {
    lead { ...LeadFull }
  }
}

input CreateLeadInput {
  clientId: String!         # UUID client-generated
  phone: String!
  fullName: String
  source: LeadSource!
  projectInterestIds: [ID!]
  notes: String
  budget: BudgetRangeInput
}
```

**BE cần:**
- [ ] Header hoặc arg `idempotencyKey` — nếu trùng, return result cũ thay vì tạo trùng
- [ ] TTL idempotency cache: 7 ngày

### 2.4 Update lead
```graphql
mutation UpdateLead($id: ID!, $input: UpdateLeadInput!, $idempotencyKey: String!, $expectedUpdatedAt: DateTime) {
  updateLead(id: $id, input: $input, idempotencyKey: $idempotencyKey, expectedUpdatedAt: $expectedUpdatedAt) {
    lead { ...LeadFull }
    conflict {                 # null nếu OK; có giá trị nếu version mismatch
      currentVersion { ...LeadFull }
      conflictingFields: [String!]
    }
  }
}
```

**Conflict policy:** xem `03-offline-sync.md` §3.

### 2.5 Change status / assign
```graphql
mutation ChangeLeadStatus($id: ID!, $newStatus: LeadStatus!, $reason: String, $idempotencyKey: String!) {
  changeLeadStatus(id: $id, newStatus: $newStatus, reason: $reason, idempotencyKey: $idempotencyKey) {
    lead { ...LeadFull }
  }
}

mutation AssignLead($id: ID!, $userId: ID!, $idempotencyKey: String!) {
  assignLead(id: $id, userId: $userId, idempotencyKey: $idempotencyKey) {
    lead { ...LeadFull }
  }
}

mutation ReturnLeadToPool($id: ID!, $reason: String, $idempotencyKey: String!) {
  returnLeadToPool(id: $id, reason: $reason, idempotencyKey: $idempotencyKey) { success }
}
```

### 2.6 Add activity
```graphql
mutation AddActivity($input: AddActivityInput!, $idempotencyKey: String!) {
  addActivity(input: $input, idempotencyKey: $idempotencyKey) {
    activity { ...ActivityFull }
    lead { id status updatedAt }   # trả về lead để client cập nhật cache
  }
}

input AddActivityInput {
  clientId: String!
  leadId: ID!
  type: ActivityType!
  content: String
  outcome: ActivityOutcome
  scheduledAt: DateTime
  durationSeconds: Int
  attachmentIds: [ID!]    # upload trước (§5), rồi attach
}
```

## 3. Reference data

```graphql
query Projects { projects { id name address status thumbnail } }
query Project($id: ID!) { project(id: $id) { id name description units { ... } } }
query TeamMembers { teamMembers { id fullName phone avatar role } }
query Me { me { id fullName phone role team { id name } } }
```

**BE cần:**
- [ ] Trả `updatedAt` trên mọi reference entity để mobile cache + invalidate

## 4. Notifications

### 4.1 Register push token
```graphql
mutation RegisterPushToken($deviceId: String!, $pushToken: String!, $platform: String!) {
  registerPushToken(deviceId: $deviceId, pushToken: $pushToken, platform: $platform) { success }
}
```

### 4.2 In-app notifications
```graphql
query Notifications($first: Int = 30, $after: String) {
  notifications(first: $first, after: $after) {
    edges { node { id type title body data readAt createdAt } }
    pageInfo { hasNextPage endCursor }
    unreadCount
  }
}

mutation MarkNotificationRead($ids: [ID!]!) {
  markNotificationRead(ids: $ids) { unreadCount }
}
```

### 4.3 Push payload (FCM/APNs)
Format chuẩn để app deeplink được:
```json
{
  "type": "NEW_LEAD" | "LEAD_REASSIGNED" | "FOLLOWUP_DUE" | "CHAT_REPLY",
  "leadId": "uuid",
  "title": "...",
  "body": "..."
}
```

**BE cần:** xác nhận FCM/APNs credentials, tên topic/channel, deeplink scheme.

## 5. File upload

```graphql
mutation CreateUploadUrl($contentType: String!, $purpose: UploadPurpose!) {
  createUploadUrl(contentType: $contentType, purpose: $purpose) {
    uploadUrl       # presigned S3 URL (PUT)
    fileId          # dùng làm attachmentId sau khi upload xong
    expiresAt
  }
}

enum UploadPurpose { ACTIVITY_PHOTO | LEAD_DOCUMENT | AVATAR }
```

**Flow client:** request URL → PUT trực tiếp S3 → reference `fileId` trong mutation.
Tránh upload qua GraphQL (multipart phức tạp với offline queue).

## 6. Realtime / Subscriptions

```graphql
subscription LeadAssignedToMe { leadAssignedToMe { lead { ...LeadCard } } }
subscription LeadUpdated($leadIds: [ID!]!) { leadUpdated(leadIds: $leadIds) { lead { ...LeadFull } } }
subscription NotificationReceived { notificationReceived { notification { ... } unreadCount } }
```

**BE cần:**
- [ ] WebSocket subscription endpoint (graphql-ws hoặc subscriptions-transport-ws)
- [ ] Auth qua connectionParams → access token
- [ ] **Hoặc** thay bằng pure-push + polling nếu BE chưa sẵn sàng WS

## 7. Version gate

```graphql
query AppConfig($platform: String!, $appVersion: String!) {
  appConfig(platform: $platform, appVersion: $appVersion) {
    minSupportedVersion       # nếu app < min → block, force update
    latestVersion
    updateUrl                 # link App Store / Play Store
    featureFlags              # JSON
    maintenanceMode { enabled message }
  }
}
```

Mobile gọi `appConfig` mỗi lần mở app → block nếu version quá cũ.

## 8. AI Chat (REST/SSE, KHÔNG GraphQL)

```
POST /api/v1/chat/stream
Content-Type: application/json
Authorization: Bearer {accessToken}

Body:
{
  "conversationId": "uuid | null (new)",
  "message": "user message",
  "context": { "projectId": "uuid", "leadId": "uuid" }
}

Response: text/event-stream
event: token
data: {"token": "Xin "}

event: token
data: {"token": "chào"}

event: source
data: {"source": {"title": "...", "url": "..."}}

event: done
data: {"conversationId": "uuid", "messageId": "uuid"}
```

```graphql
query Conversations { conversations { id title lastMessageAt } }
query Conversation($id: ID!) { conversation(id: $id) { id messages { id role content sources createdAt } } }
mutation DeleteConversation($id: ID!) { deleteConversation(id: $id) { success } }
```

**BE cần:**
- [ ] SSE endpoint `/api/v1/chat/stream` (proxy tới LLM + RAG)
- [ ] Lưu conversation history server-side
- [ ] Nguồn knowledge base: tài liệu dự án nào, format gì? (cần riêng 1 doc về RAG)

## 9. Open questions cho Tech Lead

1. **Cursor format**: Relay opaque base64 hay UUID-based?
2. **Subscriptions**: BE đã có WS chưa? Nếu chưa, MVP fallback bằng poll mỗi 30s?
3. **Idempotency key**: TTL bao lâu, store ở Redis hay DB?
4. **Rate limit** mobile: bao nhiêu req/phút, return 429 hay GraphQL error?
5. **Error format**: chuẩn `errors[].extensions.code` (UNAUTHENTICATED, FORBIDDEN, CONFLICT, RATE_LIMITED, ...) thống nhất không?
6. **Timezone**: tất cả `DateTime` trả về UTC ISO 8601?
7. **Phone normalize**: BE chuẩn hóa thành `+84...` hay client tự làm?
8. **Soft delete vs hard delete**: lead bị "xóa" thực ra ẩn hay xóa vật lý?

## 10. Checklist BE deliverable cho MVP

| # | Operation | Status | Note |
|---|-----------|--------|------|
| 1 | Auth login + refresh + logout | ❓ | Có chưa? |
| 2 | Device register + push token | ❓ | |
| 3 | Lead CRUD + idempotency_key | ❓ | |
| 4 | Lead status / assign / return-pool | ❓ | |
| 5 | Activity CRUD | ❓ | |
| 6 | Cursor pagination + updatedAfter filter | ❓ | |
| 7 | Subscriptions (WS) | ❓ | hoặc fallback polling |
| 8 | File upload presigned URL | ❓ | |
| 9 | Notifications query + mark read | ❓ | |
| 10 | Push notification (FCM/APNs) | ❓ | credentials |
| 11 | Version gate `appConfig` | ❓ | |
| 12 | SSE `/chat/stream` + RAG | ❓ | có thể defer |
