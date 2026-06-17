# Review Tính Năng Thanh Toán, Quản Lý Đơn Hàng & TTS

## 1. Giới Thiệu
Tài liệu này review lại luồng tính năng thanh toán, quản lý đơn hàng và tích hợp giọng nói (Text-To-Speech) đã được phát triển hoàn thiện cho ứng dụng Native Coffee.

## 2. Các Task Đã Thực Hiện & Cập Nhật Mới Nhất
- **Dịch vụ (Services):**
  - Cập nhật API tạo đơn hàng (`orderService`) với payload chuẩn (lấy `shiftSessionId` tự động và đồng bộ `customerName` từ tài khoản đăng nhập qua `AuthContext`).
  - Sửa lỗi hủy đơn hàng (`SYS004`) bằng cách đổi tham số `status` thành `orderStatus` trong payload của `updateOrderStatus`.
  - Tích hợp API thanh toán tiền mặt và VNPay (`paymentService`).
  - Xây dựng service Text-To-Speech dùng `expo-speech` (`ttsService`).
- **Giao diện (UI/UX):**
  - **CartScreen**: Tự động fetch thông tin người dùng đang đăng nhập (`useAuth`) để đẩy vào trường `customerName` thay vì "Khách vãng lai" cứng nhắc.
  - **OrderScreen**: Hiển thị danh sách đơn hàng đồng bộ theo chuẩn `orderStatus`.
  - **OrderDetailScreen**: Fix lỗi hiển thị tên sản phẩm và giá bằng cách sử dụng các trường dữ liệu tĩnh (snapshot) như `productNameSnapshot`, `unitPriceSnapshot`, `selectedOptionsSnapshot`, và `lineTotal` từ API.
  - **PaymentScreen**: Thêm input nhập số tiền khách đưa cho hình thức Tiền mặt, tính tiền thừa tự động; tích hợp `react-native-webview` để mở VNPay ngay trong App chống lỗi Pause hệ điều hành; tự động đóng modal và điều hướng về màn hình danh sách sau khi thanh toán thành công 2.5 giây.

---

## 3. Chi Tiết Các Chức Năng

### 3.1. Quản Lý Đơn Hàng
- **Lấy Ca Làm Việc (Shift Session):** Trước khi gọi API tạo đơn, app tự động gọi endpoint `/shift-sessions` để tìm ca làm việc có trạng thái `OPEN` lấy ra `shiftSessionId` động gán vào payload order.
- **Tạo Đơn Hàng:** Gửi payload với danh sách sản phẩm `items`, các tuỳ chọn đặc tính, và `customerName` móc trực tiếp từ `useAuth()`.
- **Danh Sách & Chi Tiết:**
  - Sử dụng trường `orderStatus` thực tế của API thay vì `status`.
  - Hủy đơn hàng và cập nhật trạng thái đã map đúng payload với tham số `orderStatus`.
  - Các mặt hàng trong đơn hiển thị đúng tên và giá trị vào thời điểm mua nhờ các trường `*Snapshot`.

### 3.2. Luồng Thanh Toán & TTS

**1. Luồng Tiền Mặt (Cash):**
- User chọn phương thức **Tiền Mặt** trong màn `PaymentScreen`. Một form nhập liệu hiện ra với mặc định là tổng đơn.
- Thu ngân có thể gõ trực tiếp số tiền khách đưa. Hệ thống tự động tính "Tiền thừa trả lại" hoặc cảnh báo "Thiếu X đồng" nếu đưa chưa đủ.
- Bấm "Thanh toán" → App gọi POST API `/payments/cash/{orderId}` với body `{ cashReceived }`.
- **Fix lỗi SYS000:** App kiểm tra `res_code === 0` (hoặc `data.isSuccess === true`) làm tiêu chí ghi nhận thành công, khắc phục triệt để lỗi App báo "Không thành công" dù Backend đã cập nhật trạng thái đơn.
- Phát TTS thông báo: *"Thanh toán thành công! Tổng tiền X đồng"*.
- **Tự động chuyển tiếp:** Sau 2.5 giây, App tự động điều hướng (Auto-Navigate) user về danh sách Đơn hàng (`OrdersTab`) thay vì bắt user bấm nút thủ công.

**2. Luồng VNPay (Auto-Detect bằng WebView):**
- User chọn phương thức **VNPay** và bấm "Tạo link VNPay".
- App gọi POST API `/payments/vnpay/create-url/{orderId}` để lấy URL.
- **Trình duyệt nhúng WebView**: App mở URL thanh toán bằng một Modal chứa `react-native-webview` chìm trong App thay vì bật Chrome, giúp giữ ứng dụng luôn Active.
- Hệ thống chạy Polling ngầm gọi API kiểm tra mỗi 3 giây. Ngay khi giao dịch có trạng thái `SUCCESS` hoặc `PAID`, hệ thống lập tức tự đóng (unmount) cái WebView.
- Chạy thông báo TTS tiếng Việt và tự động điều hướng về `OrdersTab` sau 2.5s y như luồng Tiền mặt. User hoàn toàn **KHÔNG CẦN bấm tay**.

### 3.3. Xử Lý Lỗi & Trải Nghiệm Người Dùng
- **Bắt lỗi thông minh:** Không dựa hoàn toàn vào một trường JSON có thể bị khuyết (như `isSuccess`). Kết hợp mã lỗi `res_code = 0` đảm bảo tính chính xác 100%.
- **Trải nghiệm mượt mà:** Xoá bỏ các điểm "click thừa" của phiên bản cũ bằng cách thêm Auto-Navigation (`setTimeout(navigate, 2500)`) sau khi payment success.
- **Dữ liệu chuẩn xác:** Các thông tin order history, items' snapshot được validate và render kĩ lưỡng để không hiển thị `null` hay `undefined`.
