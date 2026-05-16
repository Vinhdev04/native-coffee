/**
 * @file orderService.ts
 * @desc Service quản lý đơn hàng — tạo đơn (đúng payload API), lấy danh sách,
 *       chi tiết, cập nhật trạng thái, fetch ca làm việc hiện tại.
 * @layer services
 */

import axiosClient from "@/api/axiosClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderItem {
  productId: number | string;
  selectedProductAttributeIds: number[];
  qty: number;
  note?: string;
}

export interface CreateOrderPayload {
  branchId: number;
  shiftSessionId?: number;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  items: CreateOrderItem[];
}

// ─── Shift Session ────────────────────────────────────────────────────────────

/**
 * Lấy ca bán hàng đang mở cho branchId
 * GET /shift-sessions?branchId={branchId}&status=OPEN
 */
export const fetchActiveShiftSession = async (branchId = 1) => {
  console.log(
    `🕐 [OrderService] fetchActiveShiftSession → branchId=${branchId}`,
  );
  const response = await axiosClient.get("/shift-sessions", {
    params: { branchId, status: "OPEN", limit: 1 },
  });
  console.log("🕐 [OrderService] shiftSessions response:", response);
  return response;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Tạo đơn hàng mới
 * POST /orders  (idempotency-key tự sinh để tránh duplicate)
 */
export const createOrder = async (payload: CreateOrderPayload) => {
  const idempotencyKey = `order-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const requestPayload = {
    branchId: payload.branchId,
    ...(payload.shiftSessionId ? { shiftSessionId: payload.shiftSessionId } : {}),
    ...(payload.customerName ? { customerName: payload.customerName } : {}),
    ...(payload.customerPhone ? { customerPhone: payload.customerPhone } : {}),
    ...(payload.note ? { note: payload.note } : {}),
    items: payload.items,
  };

  console.log(
    `📦 [OrderService] createOrder payload:`,
    JSON.stringify(requestPayload, null, 2),
  );
  console.log(`🔑 [OrderService] idempotency-key: ${idempotencyKey}`);

  const response = await axiosClient.post("/orders", requestPayload, {
    headers: { "idempotency-key": idempotencyKey },
  });
  console.log(`📦 [OrderService] createOrder response:`, response);
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
  console.log(`📋 [OrderService] fetchOrders params:`, finalParams);
  const response = await axiosClient.get("/orders", { params: finalParams });
  console.log(
    `📋 [OrderService] fetchOrders → total:`,
    (response as any)?.data?.total ?? "N/A",
  );
  return response;
};

/**
 * Lấy chi tiết đơn hàng (kèm items và logs)
 * GET /orders/{id}
 */
export const fetchOrderById = async (id: number | string) => {
  const safeId = String(id);
  console.log(`🔍 [OrderService] fetchOrderById → id=${safeId}`);
  // Add branchId=1 by default to avoid 404 if order belongs to a specific branch
  const response = await axiosClient.get(`/orders/${safeId}`, {
    params: { branchId: 1 }
  });
  console.log(`🔍 [OrderService] fetchOrderById response:`, response);
  return response;
};

/**
 * Cập nhật trạng thái đơn hàng
 * PUT /orders/{id}/status  body: { orderStatus: "PAID" | "PENDING_PAYMENT" | "COMPLETED" | "CANCELLED" }
 */
export const updateOrderStatus = async (
  id: number | string,
  orderStatus: "PENDING_PAYMENT" | "PAID" | "COMPLETED" | "CANCELLED",
) => {
  const safeId = String(id);
  console.log(
    `🔄 [OrderService] updateOrderStatus → id=${safeId}, orderStatus=${orderStatus}`,
  );
  const response = await axiosClient.put(`/orders/${safeId}/status`, {
    orderStatus,
  });
  console.log(`🔄 [OrderService] updateOrderStatus response:`, response);
  return response;
};

/**
 * Hủy đơn hàng (set status CANCELLED)
 */
export const cancelOrder = async (id: number | string) => {
  return updateOrderStatus(id, "CANCELLED");
};
