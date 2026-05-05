# REVIEW — Feature Implementation & UI Refinement (05/05/2026)

## Tóm tắt phiên làm việc

Phiên này tập trung vào việc chuẩn hóa hệ thống màu sắc (Teal Theme), cập nhật tài liệu API và cải thiện trải nghiệm người dùng trên các màn hình Menu và Chi tiết sản phẩm.

---

## 1. Design System: Teal Theme Sync

### ✅ Mục tiêu:

- Loại bỏ các mã màu hardcode `#D8F1F3`, `#0B7F8C` trong toàn bộ ứng dụng.
- Đưa vào `COLORS` constant để dễ quản lý và thay đổi sau này.

### 🛠 Hành động:

- Cập nhật `src/constants/Colors.ts` thêm nhóm màu `teal`.

---

## 2. API Documentation Update

### ✅ Mục tiêu:

- Cảnh báo giới hạn `limit: 100` để tránh lỗi crash ứng dụng khi dev cố gắng lấy quá nhiều dữ liệu.

### 🛠 Hành động:

- Cập nhật `api.docs` tại các endpoint `/products` và `/orders`.

---

## 3. UI/UX Improvements & Bug Fixes

### ✅ Mục tiêu:
- Thay thế `SafeAreaView` từ `react-native` (đã deprecated) bằng `react-native-safe-area-context`.
- **Đã gỡ bỏ** section "Đánh giá khách hàng" khỏi `ProductDetailScreen` do chưa có dữ liệu thực tế từ API (tránh hardcode UI không cần thiết).
- **Tính năng mới: Grouped Attributes**: Triển khai gọi API `/attributes` để lấy danh sách nhóm thuộc tính toàn cục.
- **Tối ưu UI**: Tự động nhóm các thuộc tính của sản phẩm theo nhóm (ví dụ: Size, Đá, Đường) dựa trên `attributeId`, giúp người dùng dễ dàng lựa chọn hơn so với danh sách phẳng trước đây.
- **Fix lỗi crash `MenuScreen`**: Sửa lỗi `keyExtractor` gây crash ứng dụng khi dữ liệu sản phẩm bị thiếu `id`.
- **Fix lỗi Login (nhanvien01)**: Khắc phục lỗi `[AUTHEN001] Invalid token` do `axiosClient` tự động gửi token cũ trong header của request `/auth/login`. Đã loại trừ các endpoint công khai khỏi việc gắn header Authorization.

---

## 4. Lỗi Môi trường & Fix nhanh
- **Lỗi:** `Uncaught Error: Cannot read property 'toString' of undefined` tại `MenuScreen.tsx`.
- **Nguyên nhân:** `item.id` bị undefined trong `SectionList`.
- **Fix:** Đã thêm check `item?.id?.toString() || index.toString()`.

---

## Đề xuất tiếp theo

1. Implement pagination thực thụ cho `MenuScreen` (onEndReached).
2. Tối ưu hóa render performance cho `SectionList` khi số lượng sản phẩm lớn.

---

- **Ngày review:** 05/05/2026
- **Reviewer:** Vinhdev
