# TASK#005: [COMPLETED] Thiết kế Giao diện Trang chủ "Be Food Style" và Tích hợp API

## 1. Mô tả công việc

- Thay đổi toàn bộ layout trang chủ sang phong cách ứng dụng giao đồ ăn cao cấp (Be Food).
- Tích hợp danh mục sản phẩm (Circular Categories) và danh sách sản phẩm hàng ngang (Horizontal Product Rows).
- Xây dựng hiệu ứng đồng bộ cuộn (Active Scroll Synchronization).
- Kết nối dữ liệu thực tế từ Backend thay vì dùng mock data.

## 2. Phân tích & Giải pháp

- **Layout:** Sử dụng `SectionList` để nhóm sản phẩm theo danh mục, tối ưu hóa hiệu năng render danh sách lớn.
- **Active Scroll:** Sử dụng `onViewableItemsChanged` để nhận diện Section đang hiển thị, từ đó cập nhật trạng thái `active` của thanh Category phía trên.
- **Lazy Loading:** Áp dụng Skeleton Screens (Shimmer effect) khi đang tải dữ liệu để tránh hiện tượng màn hình trắng.
- **API Mapping:** Xử lý cấu trúc dữ liệu `data.rows` và truyền tham số `branchId: 1` bắt buộc của Backend.

## 3. Các bước xử lý

- [x] Bước 1: Tạo Component `Skeleton` và `HomeSkeleton` dùng `LinearGradient`.
- [x] Bước 2: Thiết kế `CategoryItem` dạng tròn với trạng thái active và `ProductCardHorizontal`.
- [x] Bước 3: Chuyển đổi `HomeScreen` từ `ScrollView` sang `SectionList`.
- [x] Bước 4: Cài đặt logic đồng bộ 2 chiều: Nhấn Category -> Cuộn Section; Cuộn Section -> Active Category.
- [x] Bước 5: Cấu hình `CartScreen` mới và đăng ký Navigation cho luồng mua hàng.
- [x] Bước 6: Fix lỗi API: Đổi endpoint `/api/product-categories` và gỡ bỏ tham số `page` không hỗ trợ.

## 4. Ghi chú

- Công nghệ: Expo, Lucide Icons, React Native SectionList.
- Ngày thực hiện: 04/05/2026
- Người thực hiện: Vinhdev
