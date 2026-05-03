# TASK#003: [HOÀN THÀNH] Tích hợp Expo và sửa lỗi cú pháp màn hình Auth

## 1. Mô tả công việc

- Tích hợp Expo SDK vào dự án React Native bare để hỗ trợ chạy ứng dụng qua Expo CLI.
- Khắc phục các lỗi cú pháp nghiêm trọng (Syntax Error) tại màn hình Đăng ký (`RegisterScreen.tsx`) và Đăng nhập (`LoginScreen.tsx`) do code bị lặp và lỗi thẻ đóng/mở.

## 2. Phân tích

- Dự án đang sử dụng React Native 0.83.0, yêu cầu Expo SDK 55.
- Màn hình Auth bị lỗi `Unexpected token` do các khối code bị copy-paste trùng lặp, gây ra tình trạng lồng thẻ `<ScrollView>` và `<TouchableOpacity>` không hợp lệ.

## 3. Các bước xử lý

- [x] Bước 1: Cấu hình `package.json`, `babel.config.js`, `metro.config.js` và `app.json` theo chuẩn Expo.
- [x] Bước 2: Cập nhật `index.js` sử dụng `registerRootComponent`.
- [x] Bước 3: Clean up `RegisterScreen.tsx`, loại bỏ code rác, sửa lỗi `ScrollView`.
- [x] Bước 4: Clean up `LoginScreen.tsx`, sửa lỗi `try-catch` lồng nhau và lỗi giao diện.

## 4. Giải pháp code (Code Changes)

- **Expo Config**: Chuyển preset sang `babel-preset-expo`.
- **RegisterScreen**: Loại bỏ khối code dư thừa từ dòng 114, sửa lại logic gọi `registerApi`.
- **LoginScreen**: Gộp các khối `catch` và dọn dẹp các thẻ UI bị lặp.

## 5. Ghi chú

- Ngày thực hiện: 04/05/2026
- Người thực hiện: Vinhdev
