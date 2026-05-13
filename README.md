# 🍟 Chips Bill POS

Chips Bill là giải pháp phần mềm POS (Point of Sale) chuyên dụng, được tối ưu hóa đặc biệt cho các thiết bị máy **VNPAY POS** và môi trường bán hàng tốc độ cao.

## ✨ Tính năng nổi bật

- **⚡ Tối ưu hóa cho POS**: Giao diện siêu gọn (Compact UI), mật độ thông tin cao, phù hợp với màn hình nhỏ của thiết bị cầm tay.
- **🛒 Giỏ hàng thông minh**:
  - Thêm món nhanh (Direct-to-cart) không cần qua bước trung gian.
  - Chỉnh sửa thuộc tính (Size, Topping, Ghi chú) trực tiếp ngay trong giỏ hàng.
- **📄 In hóa đơn chuyên nghiệp**:
  - Hỗ trợ in hóa đơn tạm tính cho khách xem trước.
  - In hóa đơn chính thức cho các đơn hàng đã thanh toán.
  - Giao diện hóa đơn đẹp, mô phỏng giấy in nhiệt thực tế.
- **🔊 Thông báo giọng nói (TTS)**: Phát âm thanh thông báo tiếng Việt khi hoàn tất đơn hàng hoặc gặp lỗi, giúp nhân viên nắm bắt trạng thái mà không cần nhìn màn hình.
- **🔍 Quét QR & Tìm kiếm**: Tích hợp quét mã QR đơn hàng nhanh chóng, hỗ trợ tra cứu và thanh toán ngay lập tức.

## 🎨 Màu sắc thương hiệu

| Token         | Màu       | Mô tả            |
| ------------- | --------- | ---------------- |
| `primary`     | `#FF7A00` | Chips Orange     |
| `accent`      | `#111827` | Dark Navy        |
| `background`  | `#F9FAFB` | Light Gray       |
| `surfaceWarm` | `#FFF7F0` | Warm Orange Tint |

## 🛠 Cài đặt & Khởi động

```bash
# Cài đặt dependencies
npm install

# Link font chữ (nếu cần)
npx react-native link

# Chạy ứng dụng trên Android
npm run android

# Chạy ứng dụng trên iOS
npm run ios
```

## 📦 Build & Cài đặt (Android)

### Lệnh Build file APK

```bash
# Di chuyển vào thư mục android
cd android

# Build file APK (phiên bản Release)
./gradlew assembleRelease
```

_File APK sau khi build sẽ nằm tại: `android/app/build/outputs/apk/release/app-release.apk`_

### Lệnh cài đặt APK vào máy POS (qua ADB)

```bash
# Kiểm tra thiết bị đã kết nối
adb devices

# Cài đặt file APK
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 📂 Cấu trúc thư mục

- `src/pages`: Các màn hình chính (Home, Menu, Cart, Orders, Account).
- `src/components`: Các thành phần giao diện dùng chung (ReceiptModal, ProductModal, v.v.).
- `src/services`: Xử lý logic API và phần cứng (TTS, Orders, Products).
- `src/context`: Quản lý trạng thái ứng dụng (Auth, Cart).
- `Review/`: Tài liệu luồng nghiệp vụ (System Flowcharts).

---

© 2026 Chips Bill POS. Powered by Chips Team.
