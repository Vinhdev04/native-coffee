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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token:    string;
  user:     UserDetail;
  res_code: number;
}
