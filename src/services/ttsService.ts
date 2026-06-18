/**
 * @file ttsService.ts
 * @desc Text-to-Speech service — dùng expo-speech để phát thông báo
 *       thanh toán thành công bằng giọng nói tiếng Việt.
 * @layer services
 */

import * as Speech from 'expo-speech';

const reportTtsDebug = (
  hypothesisId: string,
  msg: string,
  data: Record<string, unknown> = {},
) => {
  fetch("http://127.0.0.1:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "payment-app-crash",
      runId: "pre-fix",
      hypothesisId,
      location: "ttsService",
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
};

/**
 * Phát thông báo thanh toán thành công
 * @param amount Tổng tiền (VNĐ)
 * @param customerName Tên khách hàng (tuỳ chọn)
 */
export const speakPaymentSuccess = (amount: number, customerName?: string) => {
  // Định dạng số tiền có dấu phân cách nghìn cho dễ đọc/phát âm (nếu engine hỗ trợ)
  const amountStr = amount.toLocaleString('vi-VN');
  const text = `Thanh toán thành công ${amountStr} đồng`;

  // #region debug-point E:tts-entry
  reportTtsDebug("E", "speakPaymentSuccess called", {
    amount,
    hasCustomerName: !!customerName,
    textLength: text.length,
  });
  // #endregion

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
    // #region debug-point E:tts-before-stop
    reportTtsDebug("E", "tts stop requested before speak", {
      amount,
      hasCustomerName: !!customerName,
    });
    // #endregion
    Speech.stop()
      .then(() => {
        // #region debug-point E:tts-stop-then-speak
        reportTtsDebug("E", "tts stop resolved, calling speak", {
          amount,
          hasCustomerName: !!customerName,
        });
        // #endregion
        Speech.speak(text, speakOptions);
      })
      .catch((err: any) => {
        // #region debug-point E:tts-stop-catch
        reportTtsDebug("E", "tts stop rejected, fallback to speak", {
          amount,
          hasCustomerName: !!customerName,
          error: String(err),
        });
        // #endregion
        console.log('[TTS] Lỗi khi stop (hoặc chưa phát gì):', err);
        Speech.speak(text, speakOptions);
      });
  } catch (e) {
    // #region debug-point E:tts-outer-catch
    reportTtsDebug("E", "tts outer catch triggered", {
      amount,
      hasCustomerName: !!customerName,
      error: String(e),
    });
    // #endregion
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
