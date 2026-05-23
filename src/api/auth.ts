import request from "@/lib/axios";

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
}

// 用户信息（包含权限）
export interface UserInfo {
  id: number
  username: string
  roles: string[]
  permissions: string[]
}

// 登录返回值类型
export interface LoginResult {
  token: string;
  user: {
    id: number;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

// 登录接口
export function loginApi(data: LoginParams) {
  return request.post<LoginResult>("/admin/login", data);
}

// 获取用户信息 + 权限 ← 重点
export function getUserInfoApi() {
  return request.get<UserInfo>('/admin/info')
}

// 登出接口
export function logoutApi() {
  return request.post("/auth/logout");
}
