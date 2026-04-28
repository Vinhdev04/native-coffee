/**
 * @file encryption.ts
 * @desc Mã hóa RSA-OAEP bằng node-forge — dùng mã hóa password
 *       trước khi gửi lên server, sử dụng public key từ .env.
 * @layer utils
 */

import forge from 'node-forge';
import { APP_CONFIG } from '~/constants/Config';

/**
 * Mã hóa chuỗi bằng Public Key RSA-OAEP
 */
export const encryptWithRSA = async (text: string): Promise<string> => {
  try {
    const publicKeyPem = APP_CONFIG.publicKey;
    if (!publicKeyPem) {
      throw new Error('Public key not found in config');
    }

    const clientPublicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = clientPublicKey.encrypt(text, 'RSA-OAEP');

    return forge.util.encode64(encrypted).replace(/\r?\n|\r/g, '').trim();
  } catch (error) {
    console.error('❌ Encryption (RSA) failed:', error);
    throw error;
  }
};
