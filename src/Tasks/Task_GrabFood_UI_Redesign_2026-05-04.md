# TASK#006: [COMPLETED] Redesign UI GrabFood-Style — MenuScreen & HomeScreen tích hợp đặt hàng nhanh

## 1. Mô tả công việc

Thiết kế lại toàn bộ giao diện **MenuScreen** theo phong cách GrabFood, đồng bộ layout sản phẩm trên **HomeScreen** với khả năng đặt hàng trực tiếp từ trang chủ. Mục tiêu là người dùng có thể thấy và đặt sản phẩm ngay khi mở app mà không cần chuyển sang trang thực đơn.

## 2. Phân tích & Giải pháp

### MenuScreen — GrabFood Layout
- **Cấu trúc:** Dùng `SectionList` thay `FlatList` để nhóm sản phẩm theo danh mục, hỗ trợ `stickySectionHeadersEnabled`.
- **Category Bar:** `FlatList` ngang phía trên, mỗi chip hiển thị tên + icon category.
- **Đồng bộ 2 chiều:**
  - Nhấn chip → `scrollToLocation()` trên SectionList.
  - Cuộn SectionList → `onViewableItemsChanged` → cập nhật active chip + `scrollToIndex()` trên FlatList chip.
- **Product Row:** Mỗi sản phẩm dàn ngang 1 hàng (ảnh vuông 88×88 + thông tin phải + nút `+`).
- **Search:** Lọc theo tên sản phẩm, kết hợp với bộ lọc danh mục.

### HomeScreen — Quick Order Section
- **Sticky Header:** Header + Search nằm cố định khi scroll (`stickyHeaderIndices`).
- **Auto-rotating Banner:** 3 banner tự động chuyển mỗi 3.5 giây với dots indicator.
- **Category Filter Chips:** Lọc sản phẩm ngay trong trang chủ.
- **Mini Product Cards:** Sản phẩm hiển thị dạng row nhỏ gọn (ảnh 54×54 + tên + giá + nút `+`), load tối đa 8 sản phẩm + nút "Xem tất cả".
- **Toast Notification:** Thông báo khi thêm sản phẩm vào giỏ hàng.

## 3. Các bước xử lý

- [x] Bước 1: Tạo `Toast.tsx` component animation không phụ thuộc thư viện ngoài.
- [x] Bước 2: Redesign `MenuScreen.tsx` — SectionList + Category chips đồng bộ cuộn.
- [x] Bước 3: Tạo `ProductRow` component (GrabFood style, 1 sản phẩm/row).
- [x] Bước 4: Thêm logic `onViewableItemsChanged` để tự động active category khi cuộn.
- [x] Bước 5: Redesign `HomeScreen.tsx` — sticky header, banner slider, mini product cards.
- [x] Bước 6: Thêm `MiniProductCard` component vào HomeScreen.
- [x] Bước 7: Đồng bộ layout sản phẩm (ảnh fallback theo loại đồ uống, price format nhất quán).
- [x] Bước 8: Redesign `OrderScreen.tsx` — tab filter theo status, card hiện đại.
- [x] Bước 9: Redesign `AccountScreen.tsx` — stats card, icon menu rows, toast sắp ra mắt.
- [x] Bước 10: Redesign `ProductDetailScreen.tsx` — hero image, chip tùy chọn, toast add-to-cart.

## 4. Files thay đổi

| File | Loại thay đổi |
|------|----------------|
| `src/pages/home/HomeScreen.tsx` | Viết lại hoàn toàn |
| `src/pages/menu/MenuScreen.tsx` | Viết lại hoàn toàn |
| `src/pages/menu/ProductDetailScreen.tsx` | Viết lại hoàn toàn |
| `src/pages/orders/OrderScreen.tsx` | Viết lại hoàn toàn |
| `src/pages/account/AccountScreen.tsx` | Viết lại hoàn toàn |
| `src/components/common/Toast.tsx` | Tạo mới |
| `src/styles/theme.ts` | Cập nhật màu cam chủ đạo |
| `src/constants/Colors.ts` | Cập nhật palette |

## 5. Ghi chú kỹ thuật

- `SectionList.scrollToLocation()` cần `getItemLayout` nếu item có chiều cao không đồng đều — hiện tại dùng fallback `onScrollToIndexFailed`.
- Category `id: 'all'` là virtual không từ API — được xử lý trong `sections` useMemo.
- Tất cả ảnh đồ uống dùng Unsplash CDN với fallback theo `item.id % length` để tránh ảnh trắng.
- Toast hoạt động hoàn toàn với Animated API của React Native, không cần `react-native-toast-message`.

## 6. Thông tin

- **Ngày thực hiện:** 04/05/2026
- **Người thực hiện:** Vinhdev + Antigravity AI
- **Thời gian ước tính:** 4 giờ
