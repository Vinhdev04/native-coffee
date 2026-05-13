/**
 * @file ttsService.ts
 * @desc Text-to-Speech service — dùng expo-speech để phát thông báo
 *       thanh toán thành công bằng giọng nói tiếng Việt.
 * @layer services
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
let Speech: any = null;

const loadSpeech = async () => {
  try {
    Speech = require('expo-speech');
    console.log('🔊 [TTS] expo-speech loaded successfully');
  } catch (e) {
    console.warn('⚠️ [TTS] expo-speech not available, TTS disabled:', e);
  }
};

// Load at module init
loadSpeech();

/**
 * Phát thông báo thanh toán thành công
 * @param amount Tổng tiền (VNĐ)
 * @param customerName Tên khách hàng (tuỳ chọn)
 */
export const speakPaymentSuccess = (amount: number, customerName?: string) => {
  // Định dạng số tiền có dấu phân cách nghìn cho dễ đọc/phát âm (nếu engine hỗ trợ)
  const amountStr = amount.toLocaleString('vi-VN');
  const text = `Thanh toán thành công ${amountStr} đồng`;

  console.log(`🔊 [TTS] speakPaymentSuccess → text: "${text}"`);

  if (!Speech) {
    console.warn('⚠️ [TTS] Speech module not loaded, skipping TTS');
    return;
  }

  try {
    // Dừng phát âm cũ (bọc try-catch riêng để tránh lỗi nếu không có gì đang phát)
    try { Speech.stop(); } catch {}

    Speech.speak(text, {
      language: 'vi-VN',
      rate: 1.0,
      pitch: 1.0,
      onStart: () => console.log('🔊 [TTS] Speaking started'),
      onDone: () => console.log('🔊 [TTS] Speaking done'),
      onError: (err: any) => {
        console.error('❌ [TTS] Speaking error (vi-VN):', err);
        // Fallback to system default if vi-VN fails
        Speech.speak(text, {
          rate: 1.0,
          onStart: () => console.log('🔊 [TTS] Speaking started (fallback)'),
          onError: (e: any) => console.error('❌ [TTS] Speaking error (fallback):', e),
        });
      },
    });
  } catch (e) {
    console.error('❌ [TTS] Failed to speak:', e);
  }
};

/**
 * Dừng phát âm
 */
export const stopSpeaking = async () => {
  if (!Speech) return;
  try {
    try { await Speech.stop(); } catch {}
    console.log('🔇 [TTS] Speaking stopped');
  } catch (e) {
    console.error('❌ [TTS] Failed to stop:', e);
  }
};
