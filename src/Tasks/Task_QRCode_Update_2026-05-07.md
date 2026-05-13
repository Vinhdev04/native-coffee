# Task: Update QR Code Format for Customer Scanning

**Date:** 2026-05-07
**Component:** `OrderScreen`, `ScanQRScreen`

## Objective
Convert the data format of the QR Code printed on the bill/shown on the screen from a raw JSON payload to a web URL.

## Background
Previously, the QR Code contained a JSON string: `{"action":"view_order","orderId":76}`. While this works for the internal app scanner (`ScanQRScreen`), normal users (customers) scanning it with Zalo or their camera app only saw the raw JSON text. They expected to see their actual bill information on a webpage.

## Implementation Details
1. **OrderScreen.tsx**: 
   - Modify the `<QRCode />` component's `value` prop.
   - Replace `JSON.stringify(...)` with the URL: `https://bill-dev.chips.com.vn/order/${order.id}`.
2. **ScanQRScreen.tsx**:
   - Update `handleReadCode` to handle both the old JSON format and the new URL format.
   - For URLs, extract the `orderId` using `qrValue.includes('/order/')` and string splitting to ensure backward and forward compatibility.

## Status
- [x] Implemented in `OrderScreen.tsx`
- [x] Implemented in `ScanQRScreen.tsx`
- [x] Fixed internal scanner crash (`Camera.android.tsx` bug)

## Sơ đồ luồng (Flowchart)

```mermaid
flowchart TD
    A[Mã QR Đơn hàng\nhttps://bill-dev.chips.com.vn/order/76] --> B{Người Quét là ai?}
    
    B -- "Khách hàng\n(Dùng Zalo / Camera thường)" --> C[Hệ điều hành điện thoại\nnhận dạng URL]
    C --> D[Mở trình duyệt Web\n(Safari / Chrome)]
    D --> E[Hiển thị trang hóa đơn Online\ncho khách]
    
    B -- "Nhân viên\n(Dùng tính năng Quét mã\ntrên App Chips Bill)" --> F[App Chips Bill đọc URL]
    F --> G[Hàm handleReadCode\ntách lấy orderId = 76]
    G --> H[Điều hướng đến màn hình\nOrderDetail nội bộ]
```
