/**
 * @file paymentService.ts
 * @desc Service thanh toán — cash, VNPay URL, lịch sử thanh toán theo đơn hàng.
 * @layer services
 */

import axiosClient from '@/api/axiosClient';

/**
 * Thanh toán tiền mặt cho đơn hàng
 * POST /payments/cash/{orderId}
 * @param cashReceived Số tiền khách đưa (bằng totalAmount hoặc hơn)
 */
export const payCash = async (orderId: number | string, cashReceived: number) => {
  const safeId = String(orderId);
  console.log(`[Dịch vụ Thanh toán] Thanh toán tiền mặt -> mã đơn = ${safeId}, số tiền nhận = ${cashReceived}`);
  const response = await axiosClient.post(`/payments/cash/${safeId}`, { cashReceived });
  console.log(`[Dịch vụ Thanh toán] Phản hồi thanh toán tiền mặt:`, response);
  return response;
};

/**
 * Tạo URL thanh toán VNPay
 * POST /payments/vnpay/create-url/{orderId}
 */
export const createVNPayUrl = async (orderId: number | string, bankCode: string = 'VNPAYQR') => {
  const safeId = String(orderId);
  console.log(`[Dịch vụ Thanh toán] Tạo URL VNPay -> mã đơn = ${safeId}, mã ngân hàng = ${bankCode}`);
  const response = await axiosClient.post(`/payments/vnpay/create-url/${safeId}`, { bankCode });
  console.log(`[Dịch vụ Thanh toán] Phản hồi tạo URL VNPay:`, response);
  return response;
};

/**
 * Lấy lịch sử thanh toán của đơn hàng
 * GET /payments/order/{orderId}
 */
export const getPaymentHistory = async (orderId: number | string) => {
  const safeId = String(orderId);
  console.log(`[Dịch vụ Thanh toán] Lấy lịch sử thanh toán -> mã đơn = ${safeId}`);
  const response = await axiosClient.get(`/payments/order/${safeId}`);
  console.log(`[Dịch vụ Thanh toán] Phản hồi lịch sử thanh toán:`, response);
  return response;
};
