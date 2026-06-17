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
    console.log('[TTS] Nạp expo-speech thành công');
  } catch (e) {
    console.warn('[TTS] Thư viện expo-speech không khả dụng, đã tắt tính năng TTS:', e);
  }
};

// Tải khi khởi tạo mô-đun
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

  console.log(`[TTS] Phát thông báo thanh toán thành công -> văn bản: "${text}"`);

  if (!Speech) {
    console.warn('[TTS] Mô-đun giọng nói chưa được nạp, bỏ qua phát âm thanh');
    return;
  }

  try {
    try { Speech.stop(); } catch {}

    Speech.speak(text, {
      language: 'vi-VN',
      rate: 1.0,
      pitch: 1.0,
      onStart: () => console.log('[TTS] Bắt đầu phát giọng nói'),
      onDone: () => console.log('[TTS] Kết thúc phát giọng nói'),
      onError: (err: any) => {
        console.error('[TTS] Lỗi phát giọng nói (vi-VN):', err);
        // Fallback sang giọng mặc định của hệ thống nếu vi-VN thất bại
        Speech.speak(text, {
          rate: 1.0,
          onStart: () => console.log('[TTS] Bắt đầu phát giọng nói (dự phòng)'),
          onError: (e: any) => console.error('[TTS] Lỗi phát giọng nói (dự phòng):', e),
        });
      },
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
