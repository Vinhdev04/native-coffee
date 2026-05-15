# Review VAT Implementation

## 1. Mục tiêu (Objective)
- Tích hợp tính năng Thuế GTGT (VAT) vào luồng giỏ hàng và thanh toán.
- Cho phép nhân viên (thu ngân) điều chỉnh linh hoạt tỷ lệ phần trăm VAT (mặc định 8%).
- Hỗ trợ 3 tùy chọn cấu hình VAT:
  1. **Đã bao gồm VAT**: Tổng tiền phải trả không đổi, hệ thống tính ngược ra số tiền VAT có trong tổng tiền.
  2. **Chưa bao gồm VAT**: Hệ thống cộng thêm tiền VAT vào tổng tiền thanh toán dựa trên số tiền trước thuế.
  3. **Không tính VAT**: Không áp dụng tính toán thuế GTGT.

## 2. Luồng thực hiện (Flow Implementation)

### 2.1 CartScreen (`src/pages/cart/CartScreen.tsx`)
- Bổ sung UI lựa chọn VAT ngay trước nút thanh toán.
- Quản lý trạng thái:
  - `vatType`: Các trạng thái `'exclusive'`, `'inclusive'`, `'none'`. (Mặc định: `'inclusive'`).
  - `vatRate`: Input tỷ lệ phần trăm thuế (Mặc định: `8%`).
- Tính toán tiền thuế (VAT amount) và tổng tiền cuối cùng (Grand total) dựa theo `vatType`:
  - `inclusive`: `vatAmount = subtotal * (vatRate / (100 + vatRate))`
  - `exclusive`: `vatAmount = subtotal * (vatRate / 100)`. Tổng thu = `subtotal + vatAmount`.
- Cập nhật Payload gửi cho Backend qua hàm `createOrder`:
  - Truyền thêm `taxAmount` và `taxRate` dựa vào thông số VAT thu ngân đã thiết lập.
- Truyền thông tin xuống Modal xem trước hoá đơn `ReceiptModal`.

### 2.2 ReceiptModal (`src/components/common/ReceiptModal.tsx`)
- Nhận prop `order` mới cập nhật các tham số `vatAmount`, `vatRate`, `vatType`, và `grandTotal`.
- Tính toán và map dữ liệu về đúng format `BillData` để render hoá đơn hiển thị hoặc đẩy xuống module in qua Sunmi POS.

### 2.3 BillReceiptComponent (`src/components/BillReceiptComponent.tsx`)
- Định nghĩa lại `BillData` Interface: bổ sung `vatRate`, `vatType`.
- Rendering Logic ở khối `VAT INFO`:
  - Hiển thị Text "Đã bao gồm" hoặc "Chưa bao gồm" dựa trên `vatType`.
  - Hiển thị VAT Rate linh hoạt (`VAT (${vatRate}%)`) và tổng giá trị thuế.
  - Hiển thị Text "Không tính VAT" nếu thu ngân chọn `none`.

## 3. Các điểm lưu ý
- UI giỏ hàng hiện tại sẽ xử lý tính toán VAT real-time khi khách chọn áp dụng voucher hoặc thay đổi tỷ lệ/tùy chọn VAT.
- Các API gửi về BE cũng được đồng bộ `taxAmount` và `taxRate` để BE có thể kiểm tra chéo và lưu vào Database chính xác cho báo cáo tài chính.
