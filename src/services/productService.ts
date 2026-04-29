/**
 * @file productService.ts
 * @desc Service quản lý sản phẩm — cung cấp các hàm gọi API để lấy
 *       danh sách sản phẩm, chi tiết sản phẩm và danh mục.
 * @layer services
 */

import axiosClient from '@/api/axiosClient';

/**
 * Lấy danh sách sản phẩm từ API
 */
export const fetchProducts = async (params?: {
  categoryId?: string;
  keyword?:    string;
  page?:       number;
  limit?:      number;
}) => {
  const response = await axiosClient.get('/products', { params });
  return response;
};

/**
 * Lấy chi tiết sản phẩm theo id
 */
export const fetchProductById = async (id: string) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response;
};

/**
 * Lấy danh sách danh mục
 */
export const fetchCategories = async () => {
  const response = await axiosClient.get('/categories');
  return response;
};
