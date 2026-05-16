export type UpdateMenuDto = {
  restaurantId?: number;
  itemName?: string;
  nameVn?: string | null;
  description?: string | null;
  price?: string | number;
  isJapaneseFriendly?: boolean;
  warningTags?: string | null;
  imageUrl?: string | null;
};
