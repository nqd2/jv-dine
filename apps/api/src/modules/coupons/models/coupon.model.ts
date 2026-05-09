export type CouponModel = {
  id: number;
  restaurantId: number;
  code: string;
  discountRate: number;
  expiryDate: string;
};
