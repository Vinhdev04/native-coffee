# TASK#003: [HOÀN THÀNH] Sửa lỗi treo Loading sau khi Đăng nhập thành công

## 1. Mô tả lỗi
- **Trạng thái:** Đăng nhập thành công (Server trả về Token) nhưng app bị treo ở màn hình Đăng nhập, không chuyển vào Trang chủ.
- **Nguyên nhân:** 
    1. Server trả về dữ liệu thành công nhưng thiếu trường `res_code: 0`.
    2. Cấu trúc dữ liệu User nằm trong trường `user` thay vì `rows` hoặc `data` như dự kiến ban đầu.
    3. Bộ lọc `axiosClient` chặn lại vì tưởng là lỗi (do thiếu `res_code`).

## 2. Phân tích
- Hệ thống cần linh hoạt hơn trong việc nhận diện phản hồi thành công từ Server Chips.
- Ưu tiên kiểm tra sự tồn tại của `token` để xác định trạng thái đăng nhập.

## 3. Các bước đã xử lý
- [x] Bước 1: Cập nhật `axiosClient.ts` để không báo lỗi khi thiếu `res_code`.
- [x] Bước 2: Cập nhật `LoginScreen.tsx` để nhận diện thành công dựa trên `token` và hỗ trợ trường dữ liệu `user`.
- [x] Bước 3: Đồng bộ logic trong `AuthContext.tsx` để lấy thông tin profile từ nhiều cấu trúc khác nhau.

## 4. Giải pháp code (Code Changes)

**Trong `axiosClient.ts` (Xử lý res_code):**
```typescript
    // Chỉ coi là lỗi nếu có res_code và res_code khác 0
    if (res && res.hasOwnProperty('res_code') && res.res_code !== 0) {
      // Handle error
    }
```

**Trong `LoginScreen.tsx` (Xử lý linh hoạt):**
```typescript
      const userDataFromRows = response?.rows?.[0];
      const userDataFromData = response?.user || response?.data;
      const finalUserData = userDataFromRows || userDataFromData;
      const token = response?.token || finalUserData?.token;

      if ((response?.res_code === 0 || token) && finalUserData) {
        // Login success
      }
```

**Sửa lỗi Đăng xuất hiện thông báo đỏ (Silent Logout):**
```typescript
export const logoutApi = async () => {
  try {
    const response = await axiosClient.post('/auth/logout');
    return response;
  } catch (error) {
    return null; // Bắt lỗi tại service để tránh trigger Toast đỏ của interceptor
  }
};
```

## 5. Ghi chú
- Đã tối ưu hàm Logout: Xóa dữ liệu local ngay lập tức và bắt lỗi API để trải nghiệm người dùng mượt mà hơn.
- Ngày cập nhật: 29/04/2026
- Người thực hiện: Vinhdev
