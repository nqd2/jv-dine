export type CouponModel = {
  id: number;
  restaurantId: number;
  code: string;
  discountRate: number;
  nameJa: string | null;
  nameVn: string | null;
  descriptionJa: string | null;
  descriptionVn: string | null;
  discountType: string;
  discountValue: number;
  startDate: string | null;
  expiryDate: string;
  usageLimit: number | null;
  status: string;
  viewsCount: number;
  usagesCount: number;
};

export type CouponStatsModel = {
  total: number;
  active: number;
  paused: number;
  totalViews: number;
  totalUsages: number;
};
