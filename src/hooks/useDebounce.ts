/**
 * @file useDebounce.ts
 * @desc Custom hook trì hoãn cập nhật giá trị theo delay — tối ưu gọi
 *       API khi user đánh vào ô tìm kiếm hoặc các input thế gên.
 * @layer hooks
 */

import { useState, useEffect } from 'react';

/**
 * Hook debounce - delay cập nhật value để tránh gọi API liên tục
 * @param value Giá trị cần debounce
 * @param delay Thời gian delay (ms)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
