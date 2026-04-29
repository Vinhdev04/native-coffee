/**
 * @file encryption.ts
 * @desc Mã hóa RSA-OAEP bằng node-forge — dùng mã hóa password
 *       trước khi gửi lên server, sử dụng public key từ .env.
 * @layer utils
 */

import forge from 'node-forge';
import { APP_CONFIG } from '@/constants/Config';

/**
 * Mã hóa chuỗi bằng Public Key RSA-OAEP
 */
export const encryptWithRSA = async (text: string): Promise<string> => {
  try {
    let publicKeyPem = APP_CONFIG.publicKey;
    if (!publicKeyPem) {
      throw new Error('Public key not found in config');
    }

    // Làm sạch chuỗi: loại bỏ dấu ngoặc kép và khoảng trắng thừa
    let cleanKey = publicKeyPem.replace(/\"/g, '').trim();

    // Nếu key thiếu header/footer, tự động bọc lại theo chuẩn PEM
    if (!cleanKey.includes('-----BEGIN PUBLIC KEY-----')) {
      // Đảm bảo xuống dòng đúng quy chuẩn PEM
      cleanKey = `-----BEGIN PUBLIC KEY-----\n${cleanKey}\n-----END PUBLIC KEY-----`;
    }

    const clientPublicKey = forge.pki.publicKeyFromPem(cleanKey);
    const encrypted = clientPublicKey.encrypt(text, 'RSA-OAEP');

    return forge.util.encode64(encrypted).trim();
  } catch (error) {
    console.error('❌ Encryption (RSA) failed:', error);
    throw error;
  }
};
