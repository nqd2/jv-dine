export type CreateRestaurantDto = {
  ownerId: number;
  name: string;
  address: string;
  area?: string | null;
  workingHours?: string | null;
  minBudget?: string | number | null;
  maxBudget?: string | number | null;
  hasAirConditioner?: boolean;
  isJapaneseFriendly?: boolean;
  cleanlinessLevel?: number | null;
  languages?: string | null;
  lat?: number | null;
  long?: number | null;
};
