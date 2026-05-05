# Task: Payment, Order Management & TTS

- [x] Đọc codebase, API docs, xác nhận yêu cầu
- [x] **Services**
  - [x] `paymentService.ts` — cash, VNPay, lịch sử
  - [x] `ttsService.ts` — expo-speech TTS (dynamic require)
  - [x] `orderService.ts` — fix payload + updateOrderStatus + fetchShiftSession
- [x] **Pages**
  - [x] `OrderDetailScreen.tsx` — chi tiết + timeline + nút thanh toán
  - [x] `PaymentScreen.tsx` — cash/VNPay + lịch sử TT
  - [x] `OrderScreen.tsx` — navigate to OrderDetail
  - [x] `CartScreen.tsx` — fetch shiftSession + fix payload + navigate to OrderDetail
- [x] **Navigation**
  - [x] `RootNavigator.tsx` — thêm OrderDetail, Payment routes
- [x] **Install** expo-speech — cần chạy thủ công: `npx expo install expo-speech`
