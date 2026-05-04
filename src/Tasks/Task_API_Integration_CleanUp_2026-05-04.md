# TASK#006: [COMPLETED] Dọn dẹp Mock Data và Đồng bộ API Toàn diện

## 1. Mô tả công việc

- Loại bỏ toàn bộ dữ liệu mẫu (mock data) tại các màn hình chính.
- Khắc phục các lỗi phát sinh khi chuyển sang dữ liệu thực tế (Giá NaN, Ảnh không hiện).
- Hoàn thiện luồng đặt hàng (Checkout) với API.

## 2. Các bước thực hiện

### A. Dọn dẹp Mock Data
- [x] **MenuScreen**: Chuyển sang lấy dữ liệu từ `product-categories` và `products`.
- [x] **OrderScreen**: Kết nối API `/orders` để lấy lịch sử đơn hàng.
- [x] **ProductDetail**: Bóc tách `productAttributes` từ API để hiển thị tùy chọn (Size, Topping) động.

### B. Sửa lỗi hiển thị & Dữ liệu
- [x] **Fix Price NaN**: Cập nhật hàm `formatCurrency` để xử lý chuỗi số từ API. Ép kiểu `parseFloat` cho các trường `basePrice`.
- [x] **Fix Image Loading**: Cập nhật `CategoryItem` và `ProductCardHorizontal` để sử dụng trường `imageUrl`. Loại bỏ chặn domain `example.com`.
- [x] **Fix Order API**: Gỡ bỏ tham số `status` không hợp lệ gây lỗi 400 khi lấy danh sách đơn hàng.

### C. Tích hợp Checkout
- [x] **CartScreen**: Cài đặt hàm `handleCheckout` gọi API `POST /orders`.
- [x] **CartContext**: Cập nhật cấu trúc `CartItem` để lưu trữ ID thuộc tính (attributes) phục vụ việc tạo đơn hàng.

## 3. Kết quả đạt được
- Ứng dụng chạy 100% trên dữ liệu thật.
- Luồng Đặt món -> Giỏ hàng -> Thanh toán -> Lịch sử đơn hàng đã hoạt động mượt mà.

## 4. Ghi chú
- Ngày hoàn thành: 04/05/2026
- Người thực hiện: Vinhdev & Antigravity
