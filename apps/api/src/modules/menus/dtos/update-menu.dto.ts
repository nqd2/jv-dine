export type UpdateMenuDto = {
  restaurantId?: number;
  itemName?: string;
  price?: string | number;
  warningTags?: string | null;
  imageUrl?: string | null;
};
