# Offline-First Sync Strategy — K-Agent

> **Status:** v0.2 — strategy không đổi, chỉ thêm note về AI allocation
> **Goal:** Sale phải tạo/update lead **không cần mạng** (đi xem dự án dưới hầm, đi tỉnh sóng yếu). Khi có mạng, tự sync lên BE đúng thứ tự, không trùng, không mất.

## Note v0.2 — AI Allocation interaction
- **Lead allocation offer KHÔNG offline-able** — chỉ gửi tới sale đang online (qua subscription/push)
- Sale offline → bỏ qua trong vòng allocation, fallback sang sale khác
- Khi sale đã accept lead, mọi update lead đó (status/activity/note) là offline-first bình thường

## 1. Nguyên tắc

1. **Optimistic UI** — mọi thao tác hiển thị thành công ngay, queue mutation vào local
2. **Idempotency tuyệt đối** — mỗi mutation kèm `idempotencyKey` (UUID), BE dedupe trong 7 ngày
3. **Client-generated IDs** — entity tạo offline có `clientId` (UUID); BE trả về `id` thật khi sync, client map lại
4. **Last-write-wins mặc định** — đơn giản, ít bug; conflict phức tạp dùng manual merge UI (xem §3)
5. **Queue persisted** — mutation queue lưu MMKV, sống qua app restart
6. **Replay đúng thứ tự** — mutation cùng entity sync tuần tự (không parallel cùng `leadId`)
7. **Giới hạn rõ ràng** — sync queue > 500 items hoặc > 7 ngày → cảnh báo user

## 2. Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│ UI (RN)      │───▶│ Apollo Client   │───▶│  GraphQL BE  │
│              │    │ + cache-persist │    │              │
│  Optimistic  │    │ + MMKV store    │    └──────────────┘
│  Response    │    └────────┬────────┘
└──────────────┘             │
                             ▼
                    ┌─────────────────┐
                    │ Mutation Queue  │  ← persisted MMKV
                    │ (FIFO per       │
                    │  entityId)      │
                    └────────┬────────┘
                             │
                             ▼ (retry với exponential backoff)
                       NetInfo: online?
```

### Components
- **Apollo Client** + `apollo3-cache-persist` (storage: MMKV adapter)
- **Mutation Queue** custom (MMKV) — KHÔNG dùng Apollo's built-in retry vì cần control thứ tự
- **NetInfo** từ `@react-native-community/netinfo` — listen connectivity
- **Background sync** — khi app foreground hoặc connectivity change

## 3. Conflict resolution

### 3.1 Default: Last-Write-Wins (LWW)
Field-level LWW dựa trên `updatedAt`:
- Client gửi mutation kèm `expectedUpdatedAt` (giá trị client thấy lúc edit)
- BE so sánh với current `updatedAt`:
  - Match → apply, trả entity mới
  - Mismatch → trả về `conflict { currentVersion, conflictingFields }`

### 3.2 Conflict UI flow
```
Client thấy conflict:
  ┌──────────────────────────────────┐
  │ ⚠️  Lead bị ai đó update         │
  │                                  │
  │ Field: "status"                  │
  │  Bạn:    NEGOTIATING             │
  │  Server: DEPOSITED (by Linh)     │
  │                                  │
  │ [ Giữ của tôi ] [ Lấy server ]   │
  └──────────────────────────────────┘
```

### 3.3 Auto-resolve cases (KHÔNG hỏi user)
- **Activity log** — append-only, không bao giờ conflict, cứ append
- **Status transition hợp lệ một chiều** — vd `NEW → CONTACTED` an toàn, không cần hỏi
- **Notes** — nếu cả 2 sửa, gộp với separator `\n---\n[merged]\n`

### 3.4 Hard conflicts (block, hỏi user)
- Status transition ngược (DEPOSITED → CONTACTED)
- Assigned change (sale A reassign vs sale B reassign)
- Budget thay đổi cả 2 phía

## 4. Mutation Queue spec

```ts
type QueuedMutation = {
  id: string;                    // UUID = idempotencyKey
  entityType: 'lead' | 'activity' | 'attachment';
  entityId: string;              // clientId hoặc server id
  operation: string;             // 'createLead', 'updateLead', 'addActivity'...
  variables: Record<string, any>;
  createdAt: number;
  attemptCount: number;
  lastAttemptAt: number | null;
  lastError: string | null;
  status: 'pending' | 'inflight' | 'failed' | 'conflict';
  dependsOn: string[];           // các mutation phải sync xong trước (vd: createLead trước addActivity)
};
```

### Replay policy
- FIFO per `entityId` — cùng lead phải tuần tự
- Khác `entityId` → có thể parallel (max 4 inflight)
- Retry exponential backoff: `1s, 2s, 4s, 8s, 16s, 30s, 60s, 60s...`
- Sau 10 lần fail liên tiếp → status `failed`, hiển thị badge cho user xem

### Dependency
Khi tạo lead offline → addActivity offline:
- `createLead` mutation có `clientId = "L-uuid-1"`
- `addActivity` mutation có `dependsOn: ["L-uuid-1-mutation-id"]`, `variables.leadId = "L-uuid-1"`
- Sau khi `createLead` sync xong, BE trả `lead.id = "real-uuid"`, client **rewrite** `addActivity.variables.leadId = "real-uuid"` rồi mới gửi

## 5. Cache strategy

### 5.1 Initial sync (sau login)
Tải về local:
- `me` + team members (~50 user)
- `projects` (toàn bộ, ~10-30 dự án)
- `leads(filter: { assignedTo: me }, first: 200)` — top 200 lead gần nhất

### 5.2 Delta sync (mỗi khi online + mỗi 5 phút foreground)
```graphql
query Leads($updatedAfter: DateTime!) {
  leads(filter: { updatedAfter: $updatedAfter }, first: 100) { ... }
}
```
Lưu `lastSyncedAt` per query; gọi với `updatedAfter = lastSyncedAt`.

### 5.3 Lazy load
- Lead detail → fetch on demand (cache-and-network)
- Activity log > 50 → cursor pagination
- Conversation chat history → fetch khi mở conversation

### 5.4 Eviction
- Lead không thuộc về tôi + > 30 ngày không touch → evict khỏi cache
- Cache size cap ~50MB (MMKV store), warn nếu vượt

## 6. Edge cases

| Case | Xử lý |
|------|-------|
| User offline tạo lead → 7 ngày sau mới online | BE idempotency expired (7 ngày). Cảnh báo user, có thể trùng. → **Hint:** Nâng TTL idempotency lên 30 ngày? |
| User offline tạo lead trùng SĐT | Server reject với code `DUPLICATE_PHONE`, client báo lỗi, queue chuyển `failed`, user xem lead cũ |
| App killed giữa lúc đang sync | Mutation queue persist MMKV, restart app sẽ resume. `inflight` → reset về `pending` khi boot |
| Refresh token expired offline | UI hiển thị "Cần đăng nhập lại để sync" badge, vẫn cho thao tác local, sync sau khi login |
| Conflict không resolve được trong 24h | Báo team leader, hoặc auto-pick server side (giảm friction) |
| User đổi device giữa chừng | Mutation queue thuộc device cũ, mất. → Khuyến nghị BE cho xem "pending mutations" qua web admin |

## 7. Telemetry (Sentry breadcrumbs)
- Mỗi mutation enqueue/dequeue/retry/conflict → breadcrumb
- Sync session: số mutation processed, số conflict, duration
- Network state changes
- Cache size mỗi giờ

## 8. Test plan
- Airplane mode → tạo 5 lead, 10 activity → bật mạng → verify tất cả lên server đúng thứ tự
- Tạo lead offline → kill app → bật mạng → verify resume sync
- 2 thiết bị cùng edit 1 lead → verify conflict UI
- Idempotency: gửi cùng 1 mutation 2 lần → BE chỉ tạo 1 record

## 9. Open questions
1. **Idempotency TTL** — 7 ngày có đủ? Sale đi công tác xa có thể offline lâu hơn?
2. **Conflict UI** — sale có chịu được flow "giữ của tôi vs server" không, hay cần đơn giản hóa?
3. **Activity log offline** — có cần hiển thị "đang đợi sync" badge cho từng activity?
4. **Lead bị reassign sang sale khác trong lúc tôi offline** — khi sync, mutation của tôi có nên bị reject với "không còn quyền"? Hay vẫn cho ghi vào activity log?
