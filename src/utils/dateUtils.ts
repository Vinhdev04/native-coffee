/**
 * @file dateUtils.ts
 * @desc Tiện ích xử lý ngày giờ — chuyển Date sang chuỗi YYYYMMDDHHMMSS
 *       (gửi DB) và định dạng hiển thị DD/MM/YYYY HH:mm.
 * @layer utils
 */

/**
 * Chuyển đổi đối tượng Date sang chuỗi định dạng YYYYMMDDHHMMSS
 */
export const formatDateToSystemString = (
  date: Date | null,
  options?: { hour?: number; minute?: number; second?: number }
): string => {
  if (!date) return '';

  const d = new Date(date);

  if (options) {
    if (options.hour   !== undefined) d.setHours(options.hour);
    if (options.minute !== undefined) d.setMinutes(options.minute);
    if (options.second !== undefined) d.setSeconds(options.second);
  }

  const YYYY = d.getFullYear();
  const MM   = String(d.getMonth() + 1).padStart(2, '0');
  const DD   = String(d.getDate()).padStart(2, '0');
  const HH   = String(d.getHours()).padStart(2, '0');
  const mm   = String(d.getMinutes()).padStart(2, '0');
  const ss   = String(d.getSeconds()).padStart(2, '0');

  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
};

/**
 * Format ngày hiển thị: DD/MM/YYYY HH:mm
 */
export const formatDisplayDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const DD   = String(d.getDate()).padStart(2, '0');
  const MM   = String(d.getMonth() + 1).padStart(2, '0');
  const YYYY = d.getFullYear();
  const HH   = String(d.getHours()).padStart(2, '0');
  const mm   = String(d.getMinutes()).padStart(2, '0');
  return `${DD}/${MM}/${YYYY} ${HH}:${mm}`;
};
