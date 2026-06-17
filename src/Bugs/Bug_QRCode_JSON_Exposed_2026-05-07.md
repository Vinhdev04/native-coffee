# Bug Report: JSON Exposed via QR Code & Scanner Crash

**Date:** 2026-05-07

## Bug 1: Exposed Raw JSON to Customers via QR Code
**Symptom:**
Khi khách hàng mở Zalo quét mã QR trên hóa đơn, Zalo hiển thị nội dung `{"action":"view_order","orderId":76}` thay vì trang thông tin thanh toán.

**Root Cause:**
Component `QRCode` trong `OrderScreen.tsx` trước đây được truyền `value={JSON.stringify({action: 'view_order', orderId: order.id})}`. Mục đích ban đầu là để app quét nội bộ, nhưng điều này khiến các camera thông thường chỉ đọc ra văn bản JSON thô, không thể thực hiện được thao tác mở link.

**Resolution:**
Đã đổi `value` thành định dạng URL chuẩn: `https://bill-dev.chips.com.vn/order/${order.id}`.

---

## Bug 2: Scanner Crash (`TypeError: Cannot add new property 'zoom'`)
**Symptom:**
Khi nhân viên bấm nút quét mã QR trong app, ứng dụng bị màn hình đỏ (Crash) với lỗi `TypeError: Cannot add new property 'zoom'`.

**Root Cause:**
Thư viện `react-native-camera-kit` có lỗi cố hữu (bug) khi chạy với React Native 18+. Component `Camera` thực hiện việc gán trực tiếp thuộc tính vào object `props` (vd: `props.zoom = ...`). Trong React phiên bản mới, `props` bị đóng băng (frozen/read-only), do đó lệnh gán này gây ra Crash Exception ngay trong lần đầu render.

**Resolution:**
Đã sử dụng giải pháp thay đổi mã nguồn trong `node_modules/react-native-camera-kit/src/Camera.android.tsx` và `Camera.ios.tsx`. Object `props` được copy sang `transformedProps` (`const transformedProps: any = { ...props }`) trước khi gán các thuộc tính mặc định (`zoom`, `maxZoom`, ...).
