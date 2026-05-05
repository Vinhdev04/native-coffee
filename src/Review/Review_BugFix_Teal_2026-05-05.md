# REVIEW — Bug Fix API Limit & Teal Theme Sync (05/05/2026)

## Tóm tắt phiên làm việc

Phiên này gồm 2 nhiệm vụ: (1) sửa lỗi crash MenuScreen do vượt giới hạn API, (2) đồng bộ màu sắc teal header cho toàn bộ ứng dụng.

---

## Bug Fix: MenuScreen crash (limit: 200 → 100)

### ✅ Đánh giá: PASS

- **Root cause** xác định chính xác: `limit: 200` vượt giới hạn API backend (max 100).
- **Fix đơn giản, chính xác**, không side-effect.
- Đã kiểm tra **tất cả các file khác** dùng `limit` — đều ≤ 100.
- **Kết quả log sau fix:** Không còn error `SYS004`, API trả `✅ /products` thành công.

> [!NOTE]
> Backend trả `{"message": "Limit tối đa là 100"}` rõ ràng nhưng không có trong API docs (`api.docs`).
> Nên cập nhật tài liệu API để tránh lặp lại lỗi này.

---

## UI Change: Teal Theme Sync

### ✅ Đánh giá: PASS — Đồng bộ tốt

#### Những điểm tích cực:
- Tất cả 4 màn hình chính (Home, Menu, Orders, Account) đều có header `#D8F1F3` nhất quán.
- StatusBar đồng bộ `dark-content` + `backgroundColor: #D8F1F3` — không còn màu lẫn lộn.
- Account screen: Avatar cam nổi trên teal header — **contrast đẹp hơn** nhiều so với trước (cam text trên nền cam).
- Search bar pill shape + shadow — **UX tốt hơn**, cảm giác premium hơn.
- Category chips: Active state cam solid + text trắng — rõ ràng, dễ nhìn.

#### Điểm cần theo dõi:
- `headerTitle` một số màn hình đổi từ `COLORS.primary` (cam) → `textPrimary` (đen) để đọc được trên nền teal. Nếu sau này đổi màu header thì cần cập nhật lại.
- Icon màu teal `#0B7F8C` trong AccountScreen được hardcode — nên đưa vào `COLORS.tealIcon` trong theme.ts để dễ quản lý.

---

## Lỗi Môi trường (không liên quan code)

| Lỗi | Nguyên nhân | Hành động |
|-----|------------|-----------|
| Android emulator timeout | Pixel_8 emulator khởi động chậm | Chạy thủ công: `emulator @Pixel_8` rồi `npm run expo:android` |
| Network Error (OrderScreen) | Mạng flaky khi reload nhiều lần | Tự recover khi pull-to-refresh |

---

## Cảnh báo Kỹ thuật (Warnings — Chưa fix)

| Warning | Giải pháp đề xuất | Độ ưu tiên |
|---------|------------------|------------|
| `SafeAreaView` deprecated | Thay bằng `SafeAreaView` từ `react-native-safe-area-context` | Thấp |
| `InteractionManager` deprecated | Dùng `requestIdleCallback` | Thấp |
| `Require cycle: AuthContext` | Tách axios interceptor ra file riêng, không import AuthContext trực tiếp | Trung bình |

---

## Đề xuất cải tiến

1. **Thêm `COLORS.teal` vào `theme.ts`** — `#D8F1F3`, `#0B7F8C`, `#EBF8FA` để quản lý tập trung.
2. **Cập nhật `api.docs`** — ghi rõ giới hạn `limit: 100` cho endpoint `/products` và `/orders`.
3. **Pagination cho MenuScreen** — khi có > 100 sản phẩm, cần implement "load more" thay vì tăng limit.

---

- **Ngày review:** 05/05/2026  
- **Reviewer:** Vinhdev + Antigravity AI
