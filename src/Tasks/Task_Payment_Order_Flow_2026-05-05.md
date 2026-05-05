# Task: Hoàn Thiện Luồng Thanh Toán & Quản Lý Đơn Hàng
**Ngày thực hiện:** 05/05/2026
**Dự án:** Native Coffee

## Mục Tiêu
Tối ưu hóa và hoàn thiện hoàn toàn luồng quản lý đơn hàng, từ bước đẩy đơn hàng lên server, thanh toán (Cash & VNPay), cho đến khi thông báo thành công và quay lại danh sách.

## Chi Tiết Các Nhiệm Vụ Đã Xử Lý Hôm Nay

### 1. Quản Lý Đơn Hàng (Order Management)
- **[x] Lấy `customerName` động:** Đã chỉnh sửa `CartScreen` để tự động fetch thông tin người dùng đang đăng nhập (`useAuth()`), fallback về "Khách vãng lai" nếu không có.
- **[x] Fix hiển thị chi tiết đơn (`OrderDetailScreen`):** Chuyển từ việc lấy `productName` gốc sang dùng các trường `productNameSnapshot`, `unitPriceSnapshot`, và `lineTotal` để đảm bảo lưu đúng thông tin và giá của sản phẩm ngay tại thời điểm khách hàng mua.
- **[x] Fix lỗi huỷ đơn hàng (SYS004):** Đã đổi tham số truyền lên API `updateOrderStatus` từ `status` sang `orderStatus`, giúp xử lý triệt để lỗi 400 Bad Request khi ấn nút Huỷ Đơn.

### 2. Phương Thức Thanh Toán Tiền Mặt (Cash)
- **[x] Nhập liệu linh hoạt:** Hiển thị thêm Form (Input) nhập số tiền khách đưa khi chọn Tiền mặt. Mặc định là tổng bill, tự động tính tiền thối lại (Change).
- **[x] Guard Clause - Chặn lỗi SYS000:** Đã nâng cấp hàm kiểm tra API phản hồi. Chỉ cần API trả về `res_code === 0` là hệ thống sẽ confirm ngay lập tức (Thay vì bắt buộc phải có `data.isSuccess` như cũ).

### 3. Phương Thức Thanh Toán VNPay
- **[x] In-App WebView:** Xoá bỏ phương thức `Linking.openURL` (bị văng ra Chrome làm pause App). Thay vào đó, tích hợp **`react-native-webview`** chạy ngầm dạng Modal bên trong App.
- **[x] Auto-Close:** Background Polling (kiểm tra ngầm mỗi 3 giây) không bị Pause nữa. Khi thanh toán xong, hệ thống tự động gọi hàm tắt `WebView` ngay lập tức.

### 4. Trải Nghiệm Người Dùng (UX) & Thông Báo
- **[x] Tích hợp TTS (Text-To-Speech):** Dùng `expo-speech` để đọc giọng nữ tiếng Việt "Thanh toán thành công. Tổng tiền [Số tiền]".
- **[x] Auto-Navigate (Điều hướng tự động):** Khi vừa thanh toán xong, Toast hiện lên + loa phát tiếng, sau 2.5 giây App sẽ **tự động đóng màn hình** và quay về tab "Danh sách Đơn hàng" mà không cần người dùng thao tác bằng tay.

## Kết Quả
Hệ thống thanh toán đã đạt mức độ tự động hóa gần như 100%. Quá trình giao dịch diễn ra mượt mà, hạn chế tối đa các click thừa, và xử lý cực kỳ chặt chẽ các case API trả về thiếu trường.
