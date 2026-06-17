# TASK#004: [IN PROGRESS] Sửa lỗi Android Build và Cấu hình Gradle

## 1. Mô tả công việc

- Khắc phục lỗi build Android do cấu hình Gradle không tương thích với Expo và SDK mới.
- Giải quyết vấn đề kết nối ADB và Emulator bị offline.
- Cập nhật phiên bản Java phù hợp (JDK 21) để build Android.

## 2. Phân tích

- Lỗi `Unsupported class file major version 70` do dùng Java 26, cần hạ xuống Java 21/17.
- Cấu hình `settings.gradle` bị thiếu các plugin quan trọng của Expo sau khi migration.
- Emulator Pixel 8 bị treo process cũ khiến ADB không thể kết nối.

## 3. Các bước xử lý

- [x] Bước 1: Chạy `npx expo prebuild --platform android --clean` để tái tạo thư mục native chuẩn.
- [x] Bước 2: Cấu hình biến môi trường `JAVA_HOME` trỏ về JDK 21 của Android Studio.
- [x] Bước 3: Giải quyết lỗi Emulator Offline bằng cách kill process qemu và xóa file lock.
- [x] Bước 4: Xử lý triệt để luồng Đăng nhập/Đăng xuất (Login/Logout) với API.
- [x] Bước 5: Hiển thị danh sách sản phẩm thực tế (Show Product) từ Service.
- [x] Bước 6: Cập nhật giao diện Trang chủ (Update UI Homepage) theo thiết kế mới.
- [x] Bước 7: Kiểm tra và sửa lỗi Network Error/RSA Encryption khi Login.

## 4. Ghi chú

- Ngày thực hiện: 04/05/2026
- Người thực hiện: Vinhdev
