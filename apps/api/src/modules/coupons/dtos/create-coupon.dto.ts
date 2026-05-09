export type CreateCouponDto = {
  restaurantId: number;
  code: string;
  discountRate: number;
  expiryDate: string;
};
