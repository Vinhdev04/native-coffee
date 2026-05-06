/**
 * @file orderCache.ts
 * @desc Một singleton đơn giản để lưu trữ số lượng món của đơn hàng
 *       giúp hiển thị đúng ở màn hình danh sách khi API không trả về itemCount.
 */

class OrderCache {
  private cache: Record<number | string, number> = {};

  setCount(orderId: number | string, count: number) {
    this.cache[orderId] = count;
  }

  getCount(orderId: number | string): number | undefined {
    return this.cache[orderId];
  }

  getAll() {
    return this.cache;
  }
}

export const orderCache = new OrderCache();
