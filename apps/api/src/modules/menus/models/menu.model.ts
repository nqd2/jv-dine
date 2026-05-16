export type MenuModel = {
  id: number;
  restaurantId: number;
  itemName: string;
  nameVn: string | null;
  description: string | null;
  price: string;
  isJapaneseFriendly: boolean;
  warningTags: string | null;
  imageUrl: string | null;
};
