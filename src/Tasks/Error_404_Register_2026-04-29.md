# TASK#001: [HOÀN THÀNH] Sửa lỗi 404 Not Found khi gọi API Đăng ký

## 1. Mô tả lỗi
- **Trạng thái:** 404 Not Found (AxiosError).
- **Endpoint hiện tại:** `POST /auth/register`.
- **Hành vi:** Khi nhấn nút "Đăng ký ngay", hệ thống gọi API nhưng server trả về lỗi 404, cho biết đường dẫn này không tồn tại trên server phát triển.

## 2. Phân tích
- Server `https://bill-dev.chips.com.vn/api` hiện tại có thể chưa hỗ trợ endpoint `/auth/register` hoặc endpoint này có tên khác.
- Cần xác định lại endpoint chính xác từ tài liệu API của hệ thống Chips.

## 3. Các bước xử lý
- [x] Bước 1: Liên hệ Backend hoặc kiểm tra tài liệu API để lấy endpoint đăng ký đúng.
- [x] Bước 2: Cập nhật hàm `registerApi` trong file `src/services/authService.ts`.
- [x] Bước 3: Kiểm tra lại cấu trúc dữ liệu gửi lên (Payload) xem có khớp với yêu cầu của API mới không.

## 4. Giải pháp code (Code Changes)
Đồng bộ hóa `baseURL` trong `.env` và các service calls:
```typescript
// .env
API_URL=https://bill-dev.chips.com.vn/api

// authService.ts
export const registerApi = async (payload: any) => {
  return await axiosClient.post('/account/users', payload);
};
```
Sửa lỗi trường `username` thành `userName` để khớp API:
```typescript
userName: userName.trim(), // Fix Bad Request 400
```

## 5. Ghi chú
- Đã chuyển đổi endpoint Register từ `/auth/register` (404) sang `/account/users` dựa trên Swagger mục Account.
- Ngày cập nhật: 29/04/2026
- Người thực hiện: Vinhdev
