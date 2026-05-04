# REVIEW — UI Redesign GrabFood Style (04/05/2026)

## Tổng quan

Phiên làm việc này tập trung vào việc thiết kế lại toàn bộ giao diện người dùng theo phong cách **GrabFood**, đồng thời tích hợp khả năng đặt hàng nhanh trực tiếp từ trang chủ. Toàn bộ 5 màn hình chính đã được viết lại hoàn toàn cùng với một component Toast tùy chỉnh.

---

## Những gì đã hoàn thành

### ✅ MenuScreen — GrabFood Layout
- **`SectionList`** nhóm sản phẩm theo danh mục với sticky section headers.
- **Category chips** nằm ngang có scroll, tự động active khi cuộn danh sách.
- **Đồng bộ 2 chiều**: Nhấn chip → cuộn đến section; cuộn danh sách → cập nhật chip active (`onViewableItemsChanged`).
- **Product Row**: Mỗi sản phẩm chiếm 1 hàng ngang gồm: ảnh vuông, tên, mô tả, giá, nút `+`.
- **Search realtime** kết hợp với bộ lọc category.
- Toast notification khi thêm vào giỏ.

### ✅ HomeScreen — Đặt hàng nhanh từ trang chủ
- **Sticky header**: Tên quán + search bar cố định khi scroll.
- **Banner tự động chuyển** mỗi 3.5 giây với dots indicator.
- **Category filter chips**: Lọc sản phẩm ngay trong trang chủ.
- **Mini product cards**: Ảnh nhỏ gọn 54×54 + tên + giá + nút `+`, hiển thị tối đa 8 sản phẩm.
- Nút "Xem tất cả N sản phẩm" khi có nhiều hơn 8.
- Cart badge hiện tổng số sản phẩm trong giỏ.
- Toast notification khi thêm vào giỏ.

### ✅ ProductDetailScreen
- Hero image chiếm toàn màn hình.
- Nút yêu thích (heart toggle).
- Chip tùy chọn sản phẩm (attributes) với giá chênh lệch.
- Toast "Đã thêm vào giỏ" rồi tự quay về.

### ✅ OrderScreen
- Tab "Hiện tại" / "Lịch sử" lọc theo status API.
- Card đơn hàng hiện đại với icon trạng thái có màu.
- Loading state + Empty state riêng từng tab.

### ✅ AccountScreen
- Header cam với avatar initials + tên.
- Stats card (Đơn hàng, Yêu thích, Điểm tích).
- Menu row có icon trong hộp màu tròn.
- Toast "Sắp ra mắt" cho tính năng chưa có.

### ✅ Toast Component (`src/components/common/Toast.tsx`)
- Không dùng thư viện ngoài.
- 3 loại: `success`, `error`, `info`.
- Animation trượt từ trên xuống với Animated API.

---

## Vấn đề tồn tại

| Vấn đề | Mức độ | Ghi chú |
|--------|--------|---------|
| `SectionList.scrollToLocation()` có thể fail nếu item height không đồng đều | Thấp | Đã thêm `onScrollToIndexFailed` handler |
| Ảnh sản phẩm phụ thuộc Unsplash CDN (cần internet) | Trung bình | Cần thay bằng ảnh thật từ backend |
| `onViewableItemsChanged` không hoạt động khi list < 3 item | Thấp | Edge case hiếm gặp |
| `LinearGradient` trong `ProductDetailScreen` cũ đã xóa | Không ảnh hưởng | Đã thay bằng backgroundColor thuần |

---

## Đề xuất cải tiến tiếp theo

1. **Thêm Skeleton Loading** cho product rows khi đang fetch API.
2. **Cache API data** với React Query hoặc SWR để tránh re-fetch mỗi lần mount.
3. **Infinite scroll** trong MenuScreen cho danh sách sản phẩm lớn.
4. **Image lazy loading** với `FastImage` để tăng hiệu năng.
5. **Haptic feedback** khi nhấn nút `+`.
6. **Offline mode**: Cache sản phẩm vào AsyncStorage để hiển thị khi mất mạng.

---

## Kết luận

Giao diện đã được nâng cấp đáng kể, trải nghiệm người dùng gần với GrabFood. Người dùng có thể đặt hàng ngay từ trang chủ mà không cần thêm bước điều hướng. Toàn bộ màn hình nhất quán về màu sắc (cam `#FF7A00`), font (`BeVietnamPro`), và interaction patterns.

---

- **Ngày review:** 04/05/2026
- **Reviewer:** Vinhdev + Antigravity AI
