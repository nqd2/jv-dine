export type RestaurantModel = {
  id: number;
  ownerId: number;
  name: string;
  area: string | null;
  address: string;
  workingHours: string | null;
  minBudget: string | null;
  maxBudget: string | null;
  hasAirConditioner: boolean;
  isJapaneseFriendly: boolean;
  cleanlinessLevel: number | null;
  languages: string | null;
  lat: number | null;
  long: number | null;
};
