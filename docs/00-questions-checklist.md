# Questions Checklist — cần trả lời trước khi code

> **Status:** Pending user input
> **Purpose:** Tổng hợp các câu hỏi blocker từ 3 doc trên, chia 2 nhóm: hỏi user (sale leader) và hỏi Tech Lead BE

## A. Hỏi USER (sale leader K-CITY) — bạn tự trả lời

### A1. Lead source (từ `01-lead-model.md` Q1)
Liệt kê đủ nguồn lead K-CITY đang dùng. Tôi gợi ý: Facebook, Google, Hotline, Walk-in, Referral, Event, Zalo, TikTok, Other. **Thiếu/thừa gì?**
> ✏️ Trả lời: Lead organic từ trang noxh.net (Nền tảng nhà ở xã hội do K-CITY tự phát triển, người dùng lên đây đăng ký tài khoản, eKYC để xác thực và sử dụng hồ sơ thông minh. Muốn xem codebase không? Tôi lead dự án đó nên có thể share được. Bạn truy cập /Volumes/DATA/K-CITY/6. Products/2026-KCity-NOXH-Platform/Website-noxh-platform). Ngoài ra Agent có thể tự kiếm lead từ Facebook, Hotline, Walk-in, Event, Zalo, Referral, Other

### A2. Status pipeline (Q2)
11 status: NEW → CONTACTED → INTERESTED → APPOINTMENT → VISITED → NEGOTIATING → DEPOSITED → CONTRACTED → CLOSED_WON / CLOSED_LOST / ON_HOLD.
**Có cần thêm/bớt giai đoạn nào không?** Ví dụ "xin ý kiến lãnh đạo", "ký TTĐC trước HĐMB"?
> ✏️ Trả lời: Hãy giữ như vậy, nhớ có phần note cho Sale ghi chú thêm những thông tin khác của Lead

### A3. Lý do CLOSED_LOST cố định
Khi lead rớt, sale chọn lý do từ list nào? (giá cao, vị trí, đổi ý, không liên lạc được, mua dự án khác, …)
> ✏️ Trả lời: Có phần note để tự điền

### A4. Ownership rules (Q3) — quan trọng
- 1 lead = 1 sale, hay nhiều sale cùng phụ trách?
- Sale B có thấy lead của sale A không?
- Team leader xem được hết của team?
- Lead auto-return về pool sau bao nhiêu ngày không có activity?
- Sale có quyền tự nhả về pool không?
> ✏️ Trả lời: 1 lead = 1 sale, của ai sẽ tự thấy của người đó. Ví dụ system có 500 lead, AI có thể phân bổ (allocation cho Agent không? Làm kiểu Grab khi đưa lead (1 khách hàng book xe cho 1 Driver đó))

### A5. 1 lead — 1 dự án hay nhiều dự án? (Q4)
> ✏️ Trả lời: 1 lead = 1 dự án và nếu mua không được có thể note lại và chuyển hóa cho dự án khác. Linh hoạt

### A6. Multi-tenant (Q5)
K-CITY có nhiều chi nhánh không? Lead scope theo chi nhánh hay toàn tập đoàn xem chung?
> ✏️ Trả lời: Có nhiều sàn giao dịch (chi nhánh) nhưng phase hiện tại chỉ có 1 sàn trước, vì chúng tôi cần chứng minh app chúng tôi làm là hiệu quả

### A7. Custom fields (Q6)
Field đặc thù từng dự án mà tôi chưa cover? (đã xem nhà mẫu, vay ngân hàng nào, có sổ chưa, …)
> ✏️ Trả lời: Nhà ở xã hội. Sản phẩm ở phase này chính là nhà ở xã hội tại Việt Nam (có token hãy tự tìm hiểu thêm về luật nhà ở của Nhà ở xã hội tại Việt Nam)

### A8. Activity outcome (Q7)
6 outcome: REACHED, NO_ANSWER, WRONG_NUMBER, CALLBACK_LATER, NOT_INTERESTED, INTERESTED. **Đủ chưa?**
> ✏️ Trả lời: Ok

### A9. Budget format (Q8)
Cần phân biệt thanh toán nhanh vs vay không, hay 1 con số?
> ✏️ Trả lời: Phase hiện tại chỉ dừng ở booking (đặt cọc) nhà thành công, sau đó sẽ đẩy CRM này về CRM tổng của tập đoàn (dùng Microsoft 365 Dynamics, tính sau)

### A10. RAG knowledge base
AI chatbot sẽ trả lời từ tài liệu nào? (catalog dự án PDF, bảng giá Excel, FAQ Word, …)
- Ai maintain tài liệu này?
- Tần suất update?
- Có tài liệu nội bộ NHẠY CẢM (giá net cho sale, hoa hồng) cần phân quyền không?
> ✏️ Trả lời: tự file tôi cung cấp, tôi sẽ maintain tài liệu và update nếu cần

### A11. Brand identity (cho Phase 1 — design)
- Logo K-Agent? (dùng logo K-CITY hay làm riêng?)
- Màu chủ đạo? (K-CITY brand color?)
- Tên app hiển thị: "K-Agent" hay "K-CITY Agent"?
- Bundle ID đề xuất: `com.kcity.kagent`? (cần check Apple Developer account)
> ✏️ Trả lời: logo K-Agent làm riêng, tôi chưa có thiết kế. Brand color là màu cam (đậm hơn cam của Claude 1 xíu hehe). Tên app K-Agent. Bundle ID tôi chưa thể chốt vì chưa bàn với Tech lead

### A12. Reset password flow
Quy trình hiện tại sale quên password làm gì? (gọi admin, OTP SMS, …)
> ✏️ Trả lời: Quên mật khẩu -> Nhập lại số điện thoại -> OTP -> đặt mật khẩu mới

---

## B. Hỏi TECH LEAD BE — forward kèm 3 doc cho họ

### B1. Inventory check
File `02-api-contract.md` §10 — checklist 12 operations. **Cái nào đã có, cái nào cần build mới, ưu tiên ra sao?**

### B2. Subscriptions vs polling (§6)
BE đã có WebSocket subscription chưa? Nếu chưa, MVP fallback polling 30s được không?

### B3. Idempotency (§9 Q3)
TTL bao lâu? Store ở Redis hay DB? **Có thể nâng lên 30 ngày được không** (sale offline lâu)?

### B4. Cursor pagination format
Relay opaque base64 hay UUID-based?

### B5. Error code convention
Có chuẩn `extensions.code` thống nhất chưa? (UNAUTHENTICATED, FORBIDDEN, CONFLICT, RATE_LIMITED, DUPLICATE_PHONE, …)

### B6. SSE chat endpoint
Đã có RAG service chưa? Stack gì? Knowledge base index ra sao?

### B7. Push notification
- FCM project ID + service account JSON?
- APNs key ID + .p8 file?
- Tên topic/channel?
- Deeplink scheme đăng ký với BE?

### B8. File upload
- S3 bucket cho mobile upload có chưa?
- Presigned URL TTL?
- Max file size?

### B9. Phone normalize
Client gửi `0901...` hay `+84901...`?

### B10. Rate limit
Bao nhiêu req/phút/user? Format response 429?

---

## C. Self — quyết định technical (tôi tự chốt, user duyệt)

| # | Decision | Đề xuất |
|---|----------|---------|
| C1 | Conflict resolution | Last-write-wins + manual merge UI cho status/assigned/budget |
| C2 | Mutation queue storage | MMKV (custom), KHÔNG dùng Apollo retry |
| C3 | Cache size cap | 50 MB |
| C4 | Initial sync | top 200 lead của user |
| C5 | Delta sync interval | 5 phút foreground + on connectivity-change |
| C6 | Idempotency UUID | client-generate, persist trong queue |
| C7 | Retry backoff | 1s, 2s, 4s, 8s, 16s, 30s, 60s × 7 |
| C8 | Failed mutation | hiển thị badge sau 10 retry, user xem được list |

---

## D. Ưu tiên trả lời

**MUST trước khi code Phase 1 (UX/screens):**
A2 (status pipeline), A4 (ownership), A11 (brand)

**MUST trước khi code BE integration:**
A1, A3, A5, A6, A7, A8, A9 + toàn bộ B-section đã reply

**Có thể defer:**
A10 (RAG — defer vì BE chưa sẵn sàng), A12 (reset password — out of MVP)
