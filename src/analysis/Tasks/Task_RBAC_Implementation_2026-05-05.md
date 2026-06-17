# Kế hoạch triển khai Phân quyền (RBAC) & Giao diện đa vai trò

**Ngày:** 05/05/2026
**Dự án:** Native Coffee POS
**Mục tiêu:** Tách biệt luồng trải nghiệm và giới hạn chức năng giữa Quản lý (Admin) và Nhân viên (Staff).

---

## 1. Kiến trúc hệ thống phân quyền

### 🔐 Trạng thái xác thực (AuthContext)
- [ ] Cập nhật `User` interface để bao gồm danh sách `roles` và `permissions`.
- [ ] Lưu trữ thông tin vai trò vào `AsyncStorage` sau khi đăng nhập thành công.
- [ ] Hàm `checkPermission(screenCode)` để kiểm tra quyền truy cập nhanh.

### 🌐 Dịch vụ API (Services)
- [ ] `roleService.ts`: 
    - `fetchRoles()`: Lấy danh sách vai trò.
    - `assignRole(userId, roleId)`: Gán vai trò cho người dùng.
- [ ] `screenService.ts`:
    - `fetchScreens()`: Lấy danh sách màn hình và quyền tương ứng từ `/api/screens`.

---

## 2. Luồng điều hướng (Navigation Flow)

### 📂 Phân chia Navigator
- [ ] **AdminNavigator**: TabBar bao gồm (Thống kê, Quản lý kho, Menu, Nhân sự, Tài khoản).
- [ ] **StaffNavigator**: TabBar bao gồm (Bán hàng, Đơn hàng, Thông báo, Tài khoản).

### 🔄 Màn hình chọn vai trò (Role Selection)
- [ ] Thiết kế màn hình `RoleSelectionScreen` như ảnh mẫu (BubbleTea POS style).
- [ ] Xuất hiện sau khi Login nếu người dùng có nhiều hơn một vai trò.
- [ ] Tự động vào giao diện tương ứng nếu chỉ có một vai trò duy nhất.

---

## 3. Danh sách nhiệm vụ cụ thể (Checklist)

### 🧱 Phase 1: Foundation & API (Sáng)
- [ ] [ ] Tạo các service gọi API `/api/roles` và `/api/screens`.
- [ ] [ ] Cập nhật `AuthContext` để quản lý trạng thái vai trò hiện tại (`activeRole`).
- [ ] [ ] Viết Hook `usePermissions` để sử dụng trong các component.

### 🎨 Phase 2: UI Layouts (Chiều)
- [ ] [ ] Thiết kế màn hình `RoleSelectionScreen` với hiệu ứng Glassmorphism.
- [ ] [ ] Tạo `AdminNavigator` và `StaffNavigator` riêng biệt.
- [ ] [ ] Cập nhật `RootNavigator` để chuyển đổi giữa 2 Navigator dựa trên vai trò đã chọn.

### 🔒 Phase 3: Logic & Security (Tối)
- [ ] [ ] Ẩn/Hiện các nút chức năng (ví dụ: nút Xóa sản phẩm, Báo cáo doanh thu) dựa trên quyền.
- [ ] [ ] Xử lý trường hợp Token hết hạn hoặc quyền bị thay đổi đột ngột.
- [ ] [ ] Kiểm tra thực tế với tài khoản `nhanvien01` (Staff) và `admin` (Quản lý).

---

## 4. Giao diện mẫu (Mockup Reference)
- **Màu sắc chủ đạo:** 
    - Admin: Cam đậm / Nâu (Sự chuyên nghiệp, quản trị).
    - Staff: Teal / Xanh lá (Sự tươi mới, tốc độ phục vụ).
- **Component:** Sử dụng `Card` lớn cho màn hình chọn vai trò, kèm theo mô tả ngắn về chức năng của vai trò đó.

---
*Lưu ý: Đây là bản kế hoạch chi tiết, việc thực thi sẽ bắt đầu sau khi được xác nhận.*
