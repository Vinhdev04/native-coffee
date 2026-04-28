# Native Coffee - React Native App

Dự án React Native cho ứng dụng quản lý quán cà phê.

## Cấu trúc thư mục

```
native-coffee/
├── src/
│   ├── api/              # Axios client & interceptors
│   ├── assets/           # Fonts, Images
│   ├── components/       # Shared components
│   ├── constants/        # Colors, Config, Typography, Constants
│   ├── context/          # AuthContext, CartContext
│   ├── data/             # Mock data
│   ├── hooks/            # Custom hooks (useDebounce, ...)
│   ├── i18n/             # i18next config + locales (vi, en)
│   ├── navigation/       # RootNavigator, MainNavigator
│   ├── pages/            # Screens: home, menu, orders, account, auth
│   ├── services/         # productService, orderService
│   ├── socket/           # SocketClient singleton
│   ├── styles/           # theme.ts (COLORS, FONTS, SPACING)
│   └── utils/            # index.ts, dateUtils, encryption, permissionUtils
├── App.tsx
├── index.js
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── react-native.config.js
└── .env
```

## Màu sắc thương hiệu

| Token          | Màu        | Mô tả              |
|----------------|------------|-------------------|
| `primary`      | `#3D1C02`  | Espresso đậm       |
| `accent`       | `#C8793A`  | Caramel ấm         |
| `background`   | `#FFF8F0`  | Kem ấm             |
| `gold`         | `#D4A843`  | Vàng cà phê        |

## Khởi động

```bash
npm install
npx react-native link   # Link fonts
npm run android         # Chạy Android
npm run ios             # Chạy iOS
```

## Alias

Dùng `~` thay thế `./src/`:

```ts
import { Colors } from '~/constants/Colors';
import axiosClient from '~/api/axiosClient';
```

## Kế thừa từ mobile-cofffee

- Cấu trúc folder và file tiện ích giữ nguyên
- SocketClient, AuthContext, CartContext kế thừa logic
- Thay thế brand màu sắc và UI theo Coffee theme
