# Review: QR Code Scanning Flow

**Date:** 2026-05-07

## Hệ thống phân loại người quét mã (QR Scanner Types)

Sự thay đổi định dạng QR Code dẫn đến 2 luồng xử lý khác biệt dựa trên đối tượng quét:

### 1. Luồng dành cho Khách hàng (End-User Flow)
- **Thiết bị/App:** Camera mặc định của iPhone/Android, Zalo, Viber, các app quét QR thông thường.
- **Dữ liệu quét được:** Chuỗi URL `https://bill-dev.chips.com.vn/order/76`
- **Hành vi (Behavior):** Hệ điều hành sẽ tự động nhận diện đây là một URL và hiển thị gợi ý "Mở trình duyệt (Safari/Chrome)".
- **Kết quả:** Khách hàng được đưa đến trang web hiển thị hóa đơn thanh toán trực tuyến của mình (không cần cài app).

### 2. Luồng dành cho Nhân viên (Internal App Flow)
- **Thiết bị/App:** Ứng dụng Bill Chips (Sử dụng `ScanQRScreen`).
- **Dữ liệu quét được:** Chuỗi URL `https://bill-dev.chips.com.vn/order/76` (hoặc JSON cũ).
- **Hành vi (Behavior):** 
  - Ứng dụng quét nội dung.
  - Hàm `handleReadCode` phân tích chuỗi văn bản.
  - Xác định đây là URL có chứa `/order/` và lấy ra ID `76`.
- **Kết quả:** Ứng dụng điều hướng trực tiếp sang màn hình `OrderDetail` nội bộ với `orderId = 76`.

## Đánh giá Kỹ thuật (Technical Review)
- Việc thay đổi sang URL là một **Best Practice** trong phát triển hệ thống POS/Retail vì nó giải quyết bài toán tiếp cận khách hàng mà không cần khách hàng cài đặt thêm bất kỳ phần mềm nào.
- Cách parse URL `qrValue.split('/order/')[1]` khá ổn định và hoạt động hiệu quả cho dạng định tuyến này. Nó cũng fallback về JSON `JSON.parse()` để các hóa đơn cũ in ra vẫn có thể quét được trong nội bộ.
