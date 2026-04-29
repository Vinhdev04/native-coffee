/**
 * @file orderService.ts
 * @desc Service quản lý đơn hàng — cung cấp các hàm gọi API để tạo đơn,
 *       lấy lịch sử đơn hàng và cập nhật trạng thái đơn.
 * @layer services
 */

import axiosClient from '~/api/axiosClient';

/**
 * Tạo đơn hàng mới
 */
export const createOrder = async (payload: {
  items: {
    productId: string;
    quantity:  number;
    size:      string;
    sweetness: string;
    toppings:  string[];
    note?:     string;
  }[];
  note?: string;
}) => {
  const response = await axiosClient.post('/orders', payload);
  return response;
};

/**
 * Lấy danh sách đơn hàng của user
 */
export const fetchOrders = async (params?: { page?: number; limit?: number; status?: string }) => {
  const response = await axiosClient.get('/orders', { params });
  return response;
};

/**
 * Lấy chi tiết đơn hàng
 */
export const fetchOrderById = async (id: string) => {
  const response = await axiosClient.get(`/orders/${id}`);
  return response;
};

/**
 * Hủy đơn hàng
 */
export const cancelOrder = async (id: string) => {
  const response = await axiosClient.patch(`/orders/${id}/cancel`);
  return response;
};
