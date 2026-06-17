/**
 * @file encryption.ts
 * @desc Mã hóa RSA-OAEP bằng node-forge — dùng mã hóa password
 *       trước khi gửi lên server, tương thích cả Expo (React Native) và Web.
 * @layer utils
 */

import forge from 'node-forge';
import { APP_CONFIG } from '@/constants/Config';

let cachedPublicKeyPem: string | null = null;
let cachedForgeKey: forge.pki.rsa.PublicKey | null = null;

function normalizePem(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/"/g, "").replace(/\r/g, "").trim();
}

function getConfiguredPublicKeyPem(): string | null {
  // Kiểm tra biến môi trường an toàn cho cả React Native (process.env) và Web (import.meta.env)
  const processEnv = typeof process !== "undefined" ? process.env : {};
  let importMetaEnv: any = {};
  if (typeof document !== "undefined") {
    try {
      const getImportMeta = new Function("return import.meta");
      importMetaEnv = getImportMeta().env || {};
    } catch (_) {}
  }

  const rawValue =
    importMetaEnv.VITE_PUBLIC_KEY_RSA_SERVER_RECEIVE
    ?? importMetaEnv.VITE_PUBLIC_KEY_RSA_Server_Receive
    ?? processEnv.EXPO_PUBLIC_VITE_PUBLIC_KEY_RSA_SERVER_RECEIVE
    ?? processEnv.EXPO_PUBLIC_VITE_PUBLIC_KEY_RSA_Server_Receive
    ?? processEnv.EXPO_PUBLIC_PUBLIC_KEY
    ?? processEnv.PUBLIC_KEY
    ?? APP_CONFIG.publicKey;

  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return null;
  }

  const pem = normalizePem(rawValue);
  if (!pem.includes("-----BEGIN PUBLIC KEY-----") || !pem.includes("-----END PUBLIC KEY-----")) {
    return null;
  }

  return pem;
}

export async function loadServerPublicKey(url: string): Promise<string> {
  if (cachedPublicKeyPem) return cachedPublicKeyPem;

  const configuredPem = getConfiguredPublicKeyPem();
  if (configuredPem && !configuredPem.includes("Au7KdUZ")) {
    console.log("🔑 [Encryption] Using configured PEM:", configuredPem.replace(/\n/g, '').substring(0, 80) + "...");
    cachedPublicKeyPem = configuredPem;
    return configuredPem;
  }

  // Chuyển đổi relative URL thành absolute URL trên React Native bằng cách ghép với domain root
  const baseUrl = APP_CONFIG.apiUrl || "";
  let targetUrl = url;
  if (url.startsWith("/") && baseUrl) {
    try {
      const urlObj = new URL(baseUrl);
      targetUrl = `${urlObj.origin}${url}`; // Trỏ về domain root (ví dụ: https://bill-dev.chips.com.vn/public_key.pem)
    } catch (_) {
      targetUrl = `${baseUrl}${url}`;
    }
  }

  console.log("🔑 [Encryption] Fetching PEM from server URL:", targetUrl);
  const resp = await fetch(targetUrl);
  if (!resp.ok) throw new Error(`Failed to load server public key file ${targetUrl}`);

  const pem = normalizePem(await resp.text());
  console.log("🔑 [Encryption] Fetched PEM from server successfully:", pem.replace(/\n/g, '').substring(0, 80) + "...");
  cachedPublicKeyPem = pem;
  return pem;
}

async function getForgePublicKey(): Promise<forge.pki.rsa.PublicKey> {
  if (cachedForgeKey) return cachedForgeKey;

  const pem = await loadServerPublicKey("/public_key.pem");
  
  // Chuẩn hóa và bọc chuẩn PEM cho node-forge
  let cleanKey = pem.replace(/\"/g, '').trim();
  if (!cleanKey.includes('-----BEGIN PUBLIC KEY-----')) {
    cleanKey = `-----BEGIN PUBLIC KEY-----\n${cleanKey}\n-----END PUBLIC KEY-----`;
  }

  cachedForgeKey = forge.pki.publicKeyFromPem(cleanKey);
  return cachedForgeKey;
}

export async function encryptForClient(text: string): Promise<string> {
  const publicKey = await getForgePublicKey();
  const encrypted = publicKey.encrypt(text, 'RSA-OAEP');
  return forge.util.encode64(encrypted).trim();
}

/**
 * Hàm mã hóa ngược tương thích (backwards compatible wrapper) cho các màn hình hiện tại
 */
export async function encryptWithRSA(text: string): Promise<string> {
  try {
    return await encryptForClient(text);
  } catch (error) {
    console.error('❌ Encryption (RSA) failed:', error);
    console.warn('⚠️ Sending plain password as fallback');
    return text;
  }
}
