# Gọi API Thanh Toán, Quản Lý Đơn Hàng & TTS Thông Báo

## Tổng quan

Xây dựng luồng đầy đủ: **Tạo đơn → Theo dõi đơn hàng → Thanh toán (Cash/VNPay) → Thông báo giọng nói TTS**.  
Tất cả data từ API thật, không mock. Ưu tiên `console.log` chi tiết để debug.

---

## Proposed Changes

### 1. Service Layer

#### [MODIFY] orderService.ts
- Cập nhật `createOrder` payload đúng với API docs (`branchId`, `shiftSessionId`, `customerName`, `customerPhone`, `items[].qty`, `items[].selectedProductAttributeIds`)
- Thêm `updateOrderStatus(id, status)` → `PUT /orders/{id}/status`
- Thêm idempotency key header cho POST /orders

#### [NEW] paymentService.ts
- `payCash(orderId)` → `POST /payments/cash/{orderId}`
- `createVNPayUrl(orderId)` → `POST /payments/vnpay/create-url/{orderId}`
- `getPaymentHistory(orderId)` → `GET /payments/order/{orderId}`

---

### 2. Pages — Orders

#### [MODIFY] OrderScreen.tsx
- Thêm navigate đến `OrderDetailScreen` khi bấm "Xem chi tiết"
- Hiển thị `customerName`, `customerPhone` trong card
- Badge số lượng đơn đang chờ trên tab icon

#### [NEW] OrderDetailScreen.tsx
- Hiển thị full chi tiết đơn: items, attributes, note, createTime, status logs
- Nút **"Thanh toán"** → mở `PaymentScreen`
- Nút **"Hủy đơn"** nếu status là PENDING
- Timeline log trạng thái

#### [NEW] PaymentScreen.tsx
- 2 lựa chọn: **Tiền mặt** / **VNPay**
- Tiền mặt: gọi `payCash()` → thành công → **phát TTS** "Thanh toán thành công! Tổng tiền {X} đồng. Cảm ơn quý khách!"
- VNPay: gọi `createVNPayUrl()` → mở WebView hoặc Linking URL
- Hiển thị lịch sử thanh toán bên dưới

---

### 3. TTS — expo-speech

#### Install `expo-speech`
```
npx expo install expo-speech
```

> [!IMPORTANT]
> `expo-speech` hoạt động on-device, không cần native rebuild nếu dùng Expo Go. Với bare workflow (hiện tại là `expo run:android`), cần rebuild APK sau khi install.

#### [NEW] src/services/ttsService.ts
```ts
import * as Speech from 'expo-speech';

export const speakPaymentSuccess = (amount: number) => {
  const text = `Thanh toán thành công! Tổng tiền ${amount.toLocaleString('vi-VN')} đồng. Cảm ơn quý khách!`;
  Speech.speak(text, { language: 'vi-VN', rate: 0.9, pitch: 1.0 });
};
```

---

### 4. Navigation — RootNavigator & MainNavigator

#### [MODIFY] RootNavigator.tsx
- Thêm `OrderDetailScreen` và `PaymentScreen` vào Stack (phải nằm trong authenticated block)

---

### 5. CartScreen — Fix checkout payload

#### [MODIFY] CartScreen.tsx  
- Sau khi tạo đơn thành công → navigate đến `OrderDetailScreen` thay vì màn hình Orders chung
- Pass `orderId` từ response API

---

## Verification Plan

### Manual
1. Tạo đơn từ giỏ hàng → confirm console.log request/response
2. Vào tab Đơn hàng → xem danh sách → bấm Xem chi tiết
3. Bấm Thanh toán → chọn Tiền mặt → nghe TTS phát ra
4. Kiểm tra order status cập nhật thành PAID
5. Kiểm tra tab Lịch sử hiển thị đơn đã thanh toán

---

## Open Questions

> [!IMPORTANT]
> **shiftSessionId**: API tạo đơn yêu cầu `shiftSessionId`. Hiện tại CartScreen hardcode `branchId: 1` nhưng chưa có `shiftSessionId`. 
> Có thể hardcode `shiftSessionId: 1` hoặc fetch từ `/shift-sessions/open` trước không?

> [!IMPORTANT]
> **VNPay WebView**: Sau khi tạo URL VNPay, cần mở trong WebView nội bộ hay mở browser ngoài (Linking)? Package `react-native-webview` chưa được cài.
