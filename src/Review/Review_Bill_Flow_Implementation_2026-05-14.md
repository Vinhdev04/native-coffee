# Review & Documentation: Bill Processing Flow Implementation

## 1. Overview

Hệ thống xử lý hóa đơn (Bill Processing) được thiết kế để phục vụ hai mục đích chính:

1. **Xem trước & Chia sẻ (Digital):** Cho phép xem trước hóa đơn trên app và chia sẻ dưới dạng ảnh qua các ứng dụng khác (Zalo, Messenger...).
2. **In nhiệt trực tiếp (Physical):** Kết nối trực tiếp với máy in Sunmi POS để in hóa đơn khổ 58mm.

---

## 2. Các thành phần chính (Components & Services)

### 2.1. `BillReceiptComponent.tsx`

- **Vai trò:** UI "xương sống" của hóa đơn.
- **Đặc điểm:**
  - Thiết kế khổ 320px (~58mm).
  - Sử dụng `forwardRef` để `ViewShot` có thể chụp ảnh.
  - **Layout mới:** Đã loại bỏ địa chỉ header, dời Hotline xuống Footer, thêm dòng thuế VAT 10%.

### 2.2. `ReceiptModal.tsx` (Common Component)

- **Vai trò:** Wrapper Modal dùng chung cho toàn bộ ứng dụng.
- **Đặc điểm:**
  - Tích hợp sẵn nút **In** và **Chia sẻ**.
  - Tự động map dữ liệu từ Order sang định dạng Bill chuẩn.
  - Giúp đồng bộ giao diện in ấn ở mọi nơi (Màn hình Thanh toán & Màn hình Đơn hàng).

### 2.3. `billService.ts`

- **Vai trò:** Chứa logic thực thi native.
- **Chức năng:**
  - `printBillOnSunmi`: Sử dụng `NativeModules.SunmiPrinter` để đẩy lệnh in text/QR code. Tự động tính toán khoảng trắng để căn lề 32 ký tự.
  - `shareBillImage`: Sử dụng `ViewShot` để capture UI thành file ảnh và gọi API `Share` của hệ thống.

---

## 3. Luồng xử lý chi tiết (The Flow)

### Luồng Thanh toán thành công (`PaymentScreen.tsx`)

1. **Thanh toán thành công:** API trả về kết quả thành công.
2. **Fetch chi tiết:** Hệ thống gọi `fetchOrderById` để lấy danh sách món đầy đủ (items) vì API danh sách thường không trả về chi tiết này.
3. **Ổn định dữ liệu:** Dữ liệu hóa đơn được bọc trong `useMemo` để tránh việc tạo mới object gây nhấp nháy UI (flickering) khi Modal đang mở.
4. **Hiển thị:** User nhấn "Xem & In bill" để mở `ReceiptModal`.

### Luồng Xem lại đơn cũ (`OrderScreen.tsx`)

1. User chọn đơn trong tab "Hoàn thành".
2. Nhấn "In Bill" trong BottomSheet.
3. Hệ thống map dữ liệu đơn hàng cũ vào `ReceiptModal` và hiển thị.

---

## 4. Các điểm kỹ thuật quan trọng (Technical Highlights)

### 4.1. Khắc phục lỗi nhấp nháy (UI Flickering)

- **Vấn đề:** Do object `billData` được tạo inline trong render, dẫn đến mỗi khi cha re-render, Modal nhận props mới và render lại.
- **Giải pháp:** Sử dụng `useMemo` với dependency array chặt chẽ (`orderItems`, `totalAmount`) để giữ reference của data luôn ổn định.

### 4.2. Tính toán VAT

- **Công thức:**
  - `SubTotal = Total / 1.1` (Làm tròn)
  - `VAT = Total - SubTotal`
- Đảm bảo tổng số tiền thanh toán không đổi nhưng vẫn hiển thị được chi tiết thuế 10% như yêu cầu.

### 4.3. Đồng bộ hóa in ấn

- Sử dụng một hàm `vnd()` duy nhất để format tiền tệ.
- Sử dụng chung bảng mã màu và font chữ (`COLORS`, `FONTS`) từ theme hệ thống.

---

## 5. Hướng dẫn bảo trì (Maintenance)

- Nếu muốn đổi tên Shop: Sửa `shopName` trong `BillReceiptComponent.tsx` và `billService.ts`.
- Nếu muốn đổi khổ giấy: Điều chỉnh `width: 320` trong `BillReceiptComponent.tsx` và hằng số `maxW = 32` trong `billService.ts`.
