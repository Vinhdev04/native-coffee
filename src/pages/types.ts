/**
 * Types dùng chung cho tất cả pages
 */

export interface BaseResponse<T = any> {
  res_code:   number;
  error_code?: string;
  error_cont?: string;
  rows?:       T[];
  data?:       T;
  total?:      number;
}
