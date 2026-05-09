export type CreateMenuDto = {
  restaurantId: number;
  itemName: string;
  price: string | number;
  warningTags?: string | null;
  imageUrl?: string | null;
};
