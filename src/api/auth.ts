import request from "@/core/lib/axios";

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
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

// 登出接口
export function logoutApi() {
  return request.post("/auth/logout");
}
