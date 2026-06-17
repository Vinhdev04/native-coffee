# TASK#007: [COMPLETED] Fix Lỗi API & Đồng bộ Màu sắc Teal Theme

## 1. Mô tả công việc

Phiên làm việc này xử lý 2 nhóm công việc song song:
1. **Sửa lỗi API** — MenuScreen crash do tham số `limit` vượt quá giới hạn cho phép của backend.
2. **Đồng bộ màu sắc teal** — Chuẩn hóa toàn bộ header/StatusBar sang màu teal `#D8F1F3` để thống nhất với thiết kế GrabFood-style đã đề ra.

---

## 2. Lỗi đã sửa

### 🐛 Bug #1: MenuScreen crash — `limit: 200` vượt giới hạn API

**Triệu chứng:**
```
❌ [API Response Error] {"data": {"message": "Limit tối đa là 100"},
   "error_code": "SYS004", "error_cont": "[SYS004] Invalid parameter type", "res_code": 1}
ERROR [MenuScreen] load error: [AxiosError: Request failed with status code 400]
```

**Nguyên nhân:**
- `MenuScreen.tsx` gọi `fetchProducts({ branchId: 1, limit: 200 })`
- Backend API `/products` chỉ chấp nhận tối đa `limit: 100` — trả về HTTP 400 nếu vượt quá.
- Lỗi xảy ra ở bước redesign GrabFood-layout khi tăng limit để load đủ sản phẩm cho SectionList.

**Fix:**
```diff
- fetchProducts({ branchId: 1, limit: 200 })
+ fetchProducts({ branchId: 1, limit: 100 })
```

**File:** `src/pages/menu/MenuScreen.tsx` — dòng 143

**Kiểm tra các file khác:**
| File | Limit | Trạng thái |
|------|-------|-----------|
| `MenuScreen.tsx` | 100 | ✅ Đã fix |
| `HomeScreen.tsx` | 50  | ✅ Hợp lệ |
| `OrderScreen.tsx` | 50  | ✅ Hợp lệ |

---

## 3. Thay đổi UI — Đồng bộ Teal Theme

### Mục tiêu
Thống nhất màu sắc toàn app theo design GrabFood-style:
- **Header top bar**: `#D8F1F3` (teal nhạt) thay vì cam `#FF7A00` hoặc trắng
- **Background body**: `#F2F3F5` (xám nhạt) — tạo độ tương phản với card trắng
- **StatusBar**: `dark-content` trên nền `#D8F1F3`

### Chi tiết thay đổi theo file

#### `src/pages/home/HomeScreen.tsx`
- `safeArea`: `#FFF7ED` → `#D8F1F3`
- `container`: `#F9FAFB` → `#F2F3F5`
- `stickyHeader`: `#FFF7ED` → `#D8F1F3`, xóa border dưới
- `iconBtn / cartIconBtn`: border trắng → `rgba(255,255,255,0.65)` không border
- `search`: border → pill shape (`borderRadius: 24`) với shadow nhẹ
- `StatusBar`: `backgroundColor="#FFF7ED"` → `"#D8F1F3"`
- `MiniProductCard.addBtn`: `#111827` (đen) → `COLORS.primary` (cam)

#### `src/pages/menu/MenuScreen.tsx`
- `container`: `#FAFAFA` → `#F2F3F5`
- `header`: trắng → `#D8F1F3`, xóa border dưới
- `headerTitle`: orange → `textPrimary` (đen)
- `cartBtn`: border trắng → `rgba(255,255,255,0.65)` không border
- `searchRow`: background trắng → `#D8F1F3` (teal — search nằm trong vùng header teal)
- `searchInputWrap`: pill shape `borderRadius: 22` với shadow nhẹ
- `catChipActive`: `#FFF3E8` orange-tint → `COLORS.primary` cam solid + chữ trắng
- `StatusBar`: `"#FAFAFA"` → `"#D8F1F3"`
- `ProductRow.addBtn`: `#111827` → `COLORS.primary`
- `SectionHeader`: thêm accent bar cam 3px bên trái mỗi nhóm

#### `src/pages/orders/OrderScreen.tsx`
- `container`: `#FAFAFA` → `#F2F3F5`
- `header`: không bg → `backgroundColor: '#D8F1F3'`, padding tăng
- `headerTitle`: orange → `textPrimary`
- `refreshBtn`: border trắng → `rgba(255,255,255,0.7)` không border
- `tabsContainer`: `marginBottom: 20` → `marginTop: 14, marginBottom: 16`
- `StatusBar`: `"#FAFAFA"` → `"#D8F1F3"`

#### `src/pages/account/AccountScreen.tsx`
- `container`: `#F4F5F7` → `#F2F3F5`
- `profileHeader`: `COLORS.primary` (cam) → `#D8F1F3` (teal nhạt)
- `avatar`: nền trong suốt → `COLORS.primary` với border trắng + shadow
- `avatarText`: trắng → trắng (giữ nguyên)
- `userName`: trắng → `textPrimary` (đen — vì header giờ là teal sáng)
- `roleBadge`: `rgba(255,255,255,0.2)` → `rgba(255,122,0,0.12)` (cam nhạt)
- `roleText`: trắng → `COLORS.primary`
- `statsCard`: thêm shadow `elevation: 5`
- `menuIconWrap`: `#FFF7ED` cam nhạt → `#EBF8FA` teal nhạt
- `menuRow` icons (User/Lock/Bell): `COLORS.primary` → `#0B7F8C` (teal đậm)
- `StatusBar`: `light-content` → `dark-content`, `COLORS.primary` → `#D8F1F3`

---

## 4. Bảng màu sắc chuẩn sau khi đồng bộ

| Token | Hex | Dùng ở đâu |
|-------|-----|------------|
| **Teal header** | `#D8F1F3` | SafeArea, header bar, StatusBar tất cả màn hình |
| **Body bg** | `#F2F3F5` | Container background dưới header |
| **Card bg** | `#FFFFFF` | Product cards, menu rows, order cards |
| **Primary orange** | `#FF7A00` | CTA buttons, active chips, price, badges |
| **Teal icon** | `#0B7F8C` | Account menu icons |
| **Icon bg (teal)** | `#EBF8FA` | Account menu icon wrap |

---

## 5. Lỗi còn tồn tại (không fix trong phiên này)

| Lỗi | Mức độ | Ghi chú |
|-----|--------|---------|
| Android emulator timeout | Môi trường | Cần khởi động thủ công: `emulator @Pixel_8` |
| `SafeAreaView` deprecated | Warning | Chuyển sang `react-native-safe-area-context` sau |
| `InteractionManager` deprecated | Warning | Không ảnh hưởng runtime |
| `Require cycle: AuthContext` | Warning | Cần refactor tách axios interceptor |
| `Network Error` OrderScreen | Transient | Tự recover khi pull-to-refresh |

---

## 6. Thông tin

- **Ngày thực hiện:** 05/05/2026
- **Người thực hiện:** Vinhdev + Antigravity AI
- **Thời gian:** ~30 phút
