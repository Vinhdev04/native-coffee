/**
 * @file orderService.ts
 * @desc Service quản lý đơn hàng — tạo đơn (đúng payload API), lấy danh sách,
 *       chi tiết, cập nhật trạng thái, fetch ca làm việc hiện tại.
 * @layer services
 */

import axiosClient from '@/api/axiosClient';

// Định nghĩa kiểu dữ liệu

export interface CreateOrderItem {
  productId: number | string;
  selectedProductAttributeIds: number[];
  qty: number;
  note?: string;
}

export interface CreateOrderPayload {
  branchId: number;
  shiftSessionId: number;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  items: CreateOrderItem[];
}

// Ca bán hàng

/**
 * Lấy ca bán hàng đang mở cho branchId
 * GET /shift-sessions?branchId={branchId}&status=OPEN
 */
export const fetchActiveShiftSession = async (branchId = 1) => {
  console.log(`[Dịch vụ Đơn hàng] Lấy ca làm việc hoạt động -> mã chi nhánh = ${branchId}`);
  const response = await axiosClient.get('/shift-sessions', {
    params: { branchId, status: 'OPEN', limit: 1 },
  });
  console.log('[Dịch vụ Đơn hàng] Phản hồi ca làm việc:', response);
  return response;
};

// Đơn hàng

/**
 * Tạo đơn hàng mới
 * POST /orders (tự sinh idempotency-key để tránh trùng lặp đơn)
 */
export const createOrder = async (payload: CreateOrderPayload) => {
  const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  console.log(`[Dịch vụ Đơn hàng] Dữ liệu tạo đơn hàng:`, JSON.stringify(payload, null, 2));
  console.log(`[Dịch vụ Đơn hàng] Khóa chống trùng lặp dữ liệu: ${idempotencyKey}`);

  const response = await axiosClient.post('/orders', payload, {
    headers: { 'idempotency-key': idempotencyKey },
  });
  console.log(`[Dịch vụ Đơn hàng] Phản hồi tạo đơn hàng:`, response);
  return response;
};

/**
 * Lấy danh sách đơn hàng
 * GET /orders?branchId=1&limit=50
 */
export const fetchOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: number;
  keySearch?: string;
}) => {
  const finalParams = { branchId: 1, limit: 50, ...params };
  console.log(`[Dịch vụ Đơn hàng] Tham số lấy danh sách đơn hàng:`, finalParams);
  const response = await axiosClient.get('/orders', { params: finalParams });
  console.log(`[Dịch vụ Đơn hàng] Lấy danh sách đơn hàng -> tổng số:`, (response as any)?.data?.total ?? 'Không khả dụng');
  return response;
};

/**
 * Lấy chi tiết đơn hàng (kèm sản phẩm và nhật ký)
 * GET /orders/{id}
 */
export const fetchOrderById = async (id: number | string) => {
  console.log(`[Dịch vụ Đơn hàng] Lấy chi tiết đơn hàng -> mã đơn = ${id}`);
  const response = await axiosClient.get(`/orders/${id}`);
  console.log(`[Dịch vụ Đơn hàng] Phản hồi chi tiết đơn hàng:`, response);
  return response;
};

/**
 * Cập nhật trạng thái đơn hàng
 * PUT /orders/{id}/status body: { orderStatus: "PAID" | "PENDING_PAYMENT" | "COMPLETED" | "CANCELLED" }
 */
export const updateOrderStatus = async (
  id: number | string,
  orderStatus: 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'CANCELLED',
) => {
  console.log(`[Dịch vụ Đơn hàng] Cập nhật trạng thái đơn hàng -> mã đơn = ${id}, trạng thái = ${orderStatus}`);
  const response = await axiosClient.put(`/orders/${id}/status`, { orderStatus });
  console.log(`[Dịch vụ Đơn hàng] Phản hồi cập nhật trạng thái đơn hàng:`, response);
  return response;
};

/**
 * Hủy đơn hàng (cập nhật trạng thái thành CANCELLED)
 */
export const cancelOrder = async (id: number | string) => {
  return updateOrderStatus(id, 'CANCELLED');
};
