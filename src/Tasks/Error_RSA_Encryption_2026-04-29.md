# TASK#002: [HOÀN THÀNH] Sửa lỗi mã hóa RSA (Invalid PEM format)

## 1. Mô tả lỗi
- **Thông báo:** `Encryption (RSA) failed: Error: Invalid PEM formatted message`.
- **Vị trí:** `src/utils/encryption.ts`.
- **Hành vi:** Khi thực hiện mã hóa mật khẩu để Login hoặc Register, thư viện `node-forge` không thể đọc được Public Key từ biến môi trường.

## 2. Phân tích
- Biến `PUBLIC_KEY` trong file `.env` đang ở dạng chuỗi Base64 thuần túy.
- Thư viện `forge` yêu cầu Public Key phải có đầy đủ định dạng PEM (bao gồm dòng Header, Footer và xuống dòng đúng quy chuẩn).

## 3. Các bước xử lý
- [x] Bước 1: Cập nhật hàm `encryptWithRSA` trong `src/utils/encryption.ts` để tự động thêm Header/Footer nếu thiếu.
- [x] Bước 2: Kiểm tra lại tính hợp lệ của chuỗi Public Key trong file `.env`.
- [x] Bước 3: Test lại luồng Đăng nhập để đảm bảo mật khẩu được mã hóa đúng và gửi lên server thành công.

## 4. Giải pháp code (Code Changes)
Trong file `src/utils/encryption.ts`, đã thêm logic tự động bọc Header/Footer:
```typescript
    let cleanKey = publicKeyPem.replace(/\"/g, '').trim();

    // Tự động bọc lại theo chuẩn PEM nếu thiếu
    if (!cleanKey.includes('-----BEGIN PUBLIC KEY-----')) {
      cleanKey = `-----BEGIN PUBLIC KEY-----\n${cleanKey}\n-----END PUBLIC KEY-----`;
    }
    const clientPublicKey = forge.pki.publicKeyFromPem(cleanKey);
```

## 5. Ghi chú
- Ngày phát hiện: 29/04/2026
- Người thực hiện: Vinhdev
