/**
 * @file auth/types.ts
 * @desc Định nghĩa các model dữ liệu liên quan đến xác thực như
 *       UserDetail, LoginResponse, Credentials, v.v.
 * @layer pages/auth
 */

/**
 * Auth types - Chips Bill App
 */

export interface UserDetail {
  id:          string;
  username:    string;
  fullName?:   string;
  name?:       string;
  email?:      string;
  phone?:      string;
  avatar?:     string;
  role?:       string;
  permissions: any[];
  createdAt?:  string;
  branchId?:   number;
}

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface LoginResponse {
  res_code: number;
  token?: string;
  user?: UserDetail;
  data?: any;
  rows?: ({
    token: string;
  } & UserDetail)[];
  error_code?: string;
  error_cont?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  res_code: number;
  error_code?: string;
  error_cont?: string;
  message?: string;
}
