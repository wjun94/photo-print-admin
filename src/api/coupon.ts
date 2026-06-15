import request from "@/lib/axios";

// 优惠券类型枚举
export enum CouponType {
  FULL_REDUCE = 1, // 满减券
  NO_THRESHOLD = 2, // 无门槛券
  DISCOUNT = 3, // 折扣券
}

// 发布状态枚举
export enum PublishStatus {
  UNPUBLISHED = 0, // 未发布
  PUBLISHED = 1, // 已发布
  OFFLINE = 2, // 已下架
}

// 使用范围枚举
export enum UseScope {
  ALL = 1, // 全平台通用
  SPEC = 2, // 指定商品
}

// 有效期类型枚举
export enum TimeType {
  FIXED = 1, // 固定时间段
  AFTER = 2, // 领取后N天有效
}

// 用户领券限制类型
export enum UserLimitType {
  UNLIMITED = 1, // 不限
  LIMIT_N = 2, // 单人限N张
  LIMIT_ONE = 3, // 单人限1张
}

// 优惠券类型定义
export interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  publishStatus: PublishStatus;
  fullAmount: number;
  reduceAmount: number;
  discountRate: number;
  maxReduce: number;
  useScope: UseScope;
  productIds: string;
  timeType: TimeType;
  validStart?: string;
  validEnd?: string;
  validDays: number;
  totalStock: number;
  receivedNum: number;
  userLimitType: UserLimitType;
  userLimitNum: number;
  targetUserType: number;
  receiveStart: string;
  receiveEnd: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
}

// 列表查询参数
export interface CouponListParams {
  page: number;
  pageSize: number;
  name?: string;
  type?: CouponType;
  publishStatus?: PublishStatus;
}

// 获取优惠券列表
export const getCouponListApi = (params: CouponListParams) => {
  return request("/admin/coupon", {
    method: "GET",
    params,
  });
};

// 获取优惠券详情
export const getCouponDetailApi = (id: string) => {
  return request(`/admin/coupon/${id}`, {
    method: "GET",
  });
};

// 创建优惠券
export const createCouponApi = (data: Partial<Coupon>) => {
  return request("/admin/coupon", {
    method: "POST",
    data,
  });
};

// 更新优惠券
export const updateCouponApi = (id: string, data: Partial<Coupon>) => {
  return request(`/admin/coupon/${id}`, {
    method: "PUT",
    data,
  });
};

// 删除优惠券
export const deleteCouponApi = (id: string) => {
  return request(`/admin/coupon/${id}`, {
    method: "DELETE",
  });
};

// 枚举映射（文本和颜色）
export const couponTypeMap: Record<
  CouponType,
  { text: string; color: string }
> = {
  [CouponType.FULL_REDUCE]: { text: "满减券", color: "orange" },
  [CouponType.NO_THRESHOLD]: { text: "无门槛券", color: "green" },
  [CouponType.DISCOUNT]: { text: "折扣券", color: "blue" },
};

export const publishStatusMap: Record<
  PublishStatus,
  { text: string; color: string }
> = {
  [PublishStatus.UNPUBLISHED]: { text: "未发布", color: "default" },
  [PublishStatus.PUBLISHED]: { text: "已发布", color: "success" },
  [PublishStatus.OFFLINE]: { text: "已下架", color: "error" },
};

export const useScopeMap: Record<UseScope, string> = {
  [UseScope.ALL]: "全平台通用",
  [UseScope.SPEC]: "指定商品",
};

export const timeTypeMap: Record<TimeType, string> = {
  [TimeType.FIXED]: "固定时间段",
  [TimeType.AFTER]: "领取后N天有效",
};
