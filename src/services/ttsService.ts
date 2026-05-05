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
  const amountStr = amount.toString();
  const text = `Đã nhận thanh toán ${amountStr} đồng. Xin cảm ơn!`;

  console.log(`🔊 [TTS] speakPaymentSuccess → text: "${text}"`);

  if (!Speech) {
    console.warn('⚠️ [TTS] Speech module not loaded, skipping TTS');
    return;
  }

  try {
    // Dừng phát âm cũ (không await để tránh delay khởi tạo âm thanh mới)
    Speech.stop();

    Speech.speak(text, {
      language: 'vi-VN',
      rate: 1.0, // Tăng tốc độ để cảm giác phản hồi nhanh hơn
      pitch: 1.0,
      onStart: () => console.log('🔊 [TTS] Speaking started'),
      onDone: () => console.log('🔊 [TTS] Speaking done'),
      onError: (err: any) => console.error('❌ [TTS] Speaking error:', err),
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
    await Speech.stop();
    console.log('🔇 [TTS] Speaking stopped');
  } catch (e) {
    console.error('❌ [TTS] Failed to stop:', e);
  }
};
