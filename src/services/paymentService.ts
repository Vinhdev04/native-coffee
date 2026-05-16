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
  console.log(`💰 [PaymentService] payCash → orderId=${safeId}, cashReceived=${cashReceived}`);
  const response = await axiosClient.post(`/payments/cash/${safeId}`, { cashReceived });
  console.log(`💰 [PaymentService] payCash response:`, response);
  return response;
};

/**
 * Tạo URL thanh toán VNPay
 * POST /payments/vnpay/create-url/{orderId}
 */
export const createVNPayUrl = async (orderId: number | string, bankCode: string = 'VNPAYQR') => {
  const safeId = String(orderId);
  console.log(`🏦 [PaymentService] createVNPayUrl → orderId=${safeId}, bankCode=${bankCode}`);
  const response = await axiosClient.post(`/payments/vnpay/create-url/${safeId}`, { bankCode });
  console.log(`🏦 [PaymentService] createVNPayUrl response:`, response);
  return response;
};

/**
 * Lấy lịch sử thanh toán của đơn hàng
 * GET /payments/order/{orderId}
 */
export const getPaymentHistory = async (orderId: number | string) => {
  const safeId = String(orderId);
  console.log(`📋 [PaymentService] getPaymentHistory → orderId=${safeId}`);
  const response = await axiosClient.get(`/payments/order/${safeId}`);
  console.log(`📋 [PaymentService] getPaymentHistory response:`, response);
  return response;
};
