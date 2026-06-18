/**
 * @file ttsService.ts
 * @desc Text-to-Speech service — dùng expo-speech để phát thông báo
 *       thanh toán thành công bằng giọng nói tiếng Việt.
 * @layer services
 */

import * as Speech from 'expo-speech';

/**
 * Phát thông báo thanh toán thành công
 * @param amount Tổng tiền (VNĐ)
 * @param customerName Tên khách hàng (tuỳ chọn)
 */
export const speakPaymentSuccess = (amount: number, customerName?: string) => {
  // Định dạng số tiền có dấu phân cách nghìn cho dễ đọc/phát âm (nếu engine hỗ trợ)
  const amountStr = amount.toLocaleString('vi-VN');
  const text = `Thanh toán thành công ${amountStr} đồng`;

  console.log(`[TTS] Phát thông báo thanh toán thành công -> văn bản: "${text}"`);

  if (!Speech) {
    console.warn('[TTS] Mô-đun giọng nói chưa được nạp, bỏ qua phát âm thanh');
    return;
  }

  try {
    const speakOptions = {
      language: 'vi-VN',
      rate: 1.0,
      pitch: 1.0,
    };

    // Gọi stop() trước, đợi nó hoàn thành hoặc thất bại rồi mới gọi speak() để tránh bị hủy giữa chừng.
    // Không sử dụng callback trong options (onStart, onDone, onError) trên Android để tránh lỗi
    // gọi luồng không đồng bộ gây crash native (lỗi tự thoát app sau khi thanh toán).
    Speech.stop()
      .then(() => {
        Speech.speak(text, speakOptions);
      })
      .catch((err: any) => {
        console.log('[TTS] Lỗi khi stop (hoặc chưa phát gì):', err);
        Speech.speak(text, speakOptions);
      });
  } catch (e) {
    console.error('[TTS] Không thể phát giọng nói:', e);
  }
};

/**
 * Dừng phát âm
 */
export const stopSpeaking = async () => {
  if (!Speech) return;
  try {
    try { await Speech.stop(); } catch {}
    console.log('[TTS] Đã dừng phát giọng nói');
  } catch (e) {
    console.error('[TTS] Dừng phát giọng nói thất bại:', e);
  }
};
