/**
 * @file auth/types.ts
 * @desc Định nghĩa các model dữ liệu liên quan đến xác thực như
 *       UserDetail, LoginResponse, Credentials, v.v.
 * @layer pages/auth
 */

/**
 * Auth types - Native Coffee App
 */

export interface UserDetail {
  id:          string;
  username:    string;
  fullName?:   string;
  email?:      string;
  phone?:      string;
  avatar?:     string;
  role?:       string;
  permissions: any[];
  createdAt?:  string;
}

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface LoginResponse {
  res_code: number;
  rows: ({
    token: string;
  } & UserDetail)[];
  error_code?: string;
  error_cont?: string;
}

export interface RegisterPayload {
  userName:    string;
  password:    string;
  fullName:    string;
  email?:      string;
  phone?:      string;
  inviterCode?: string;
}

export interface RegisterResponse {
  res_code: number;
  error_code?: string;
  error_cont?: string;
  rows?: any[];
}
