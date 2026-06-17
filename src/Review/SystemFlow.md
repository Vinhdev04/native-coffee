# Chips Bill POS - Quy trình hệ thống (Review)

Tài liệu này tổng hợp các luồng xử lý chính của ứng dụng Chips Bill đã được tối ưu hóa cho thiết bị POS.

## 1. Luồng Bán hàng (Sales Flow)
Luồng này tập trung vào tốc độ nhập liệu và tính linh hoạt khi chỉnh sửa món.

```mermaid
graph TD
    A[Bắt đầu: Màn hình Home/Menu] --> B{Tìm kiếm / Chọn món}
    B -- Click nút '+' --> C[Thêm trực tiếp vào Giỏ hàng]
    B -- Click vào ảnh/tên --> D[Mở Modal chi tiết]
    D -- Chọn thuộc tính & SL --> C
    
    C --> E[Hiện Toast thông báo]
    E -- Click vào Toast --> F[Chuyển tới Giỏ hàng]
    
    F --> G{Kiểm tra Giỏ hàng}
    G -- Click món --> H[Chỉnh sửa thuộc tính/SL trực tiếp]
    G -- Click Icon Máy in --> I[Xem trước Hóa đơn tạm tính]
    
    G -- Click 'Thanh toán' --> J[Màn hình Thanh toán]
    J --> K{Chọn phương thức}
    K -- Tiền mặt --> L[Hoàn tất đơn hàng]
    K -- VNPAY QR --> M[Quét mã QR trên máy POS]
    
    L --> N[In hóa đơn & Thông báo giọng nói]
    M --> N
```

## 2. Luồng Quản lý Đơn hàng & In ấn (Order Management & Print Flow)
Luồng xử lý đơn đã hoàn thành và in lại hóa đơn.

```mermaid
graph TD
    A1[Màn hình Đơn hàng] --> B1[Chọn đơn Hoàn thành/Đã thanh toán]
    B1 --> C1[Mở Bottom Sheet Chi tiết]
    C1 --> D1{Thao tác}
    D1 -- Click 'In Bill' --> E1[Mở Modal Hóa đơn đẹp]
    D1 -- Click QR --> F1[Xem chi tiết online]
    E1 -- Chọn 'In' --> G1[Gửi lệnh tới máy in POS]
```

## 3. Luồng Quét mã QR (Scan QR Flow)

```mermaid
graph TD
    S1[Mở Scanner] --> S2[Quét QR đơn hàng]
    S2 --> S3{Kết quả?}
    S3 -- Thành công --> S4[Hiện Bottom Sheet thông tin đơn]
    S3 -- Thất bại --> S5[Thông báo lỗi/Thử lại]
    S4 --> S6[Cho phép Thanh toán/In ấn nhanh]
```

## 4. Các điểm tối ưu kỹ thuật
- **UI Compact**: Giảm padding/margin tối đa cho màn hình POS.
- **Direct-to-Cart**: Bỏ qua bước modal trung gian khi không cần chọn thuộc tính.
- **In-place Edit**: Update item trong giỏ hàng thông qua `cartId` duy nhất.
- **Receipt Preview**: Sử dụng `ReceiptModal` chung cho toàn ứng dụng để đảm bảo tính nhất quán.
