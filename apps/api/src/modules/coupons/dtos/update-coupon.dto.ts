export type UpdateCouponDto = {
  restaurantId?: number;
  code?: string;
  discountRate?: number;
  nameJa?: string;
  nameVn?: string;
  descriptionJa?: string;
  descriptionVn?: string;
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number | null;
  status?: string;
};
