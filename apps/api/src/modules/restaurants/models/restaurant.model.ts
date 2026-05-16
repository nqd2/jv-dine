export type RestaurantModel = {
  id: number;
  ownerId: number;
  name: string;
  nameVn: string | null;
  descriptionJa: string | null;
  descriptionVn: string | null;
  area: string | null;
  address: string;
  phone: string | null;
  cuisine: string | null;
  workingHours: string | null;
  minBudget: string | null;
  maxBudget: string | null;
  hasAirConditioner: boolean;
  isJapaneseFriendly: boolean;
  hasWifi: boolean;
  hasParking: boolean;
  hasEnglishSupport: boolean;
  acceptsCards: boolean;
  hasDelivery: boolean;
  acceptsReservations: boolean;
  cleanlinessLevel: number | null;
  languages: string | null;
  lat: number | null;
  long: number | null;
  imageUrl: string | null;
  averageRating: number | null;
  reviewCount: number;
  distanceKm: number | null;
};

export type RestaurantDetailModel = {
  restaurant: RestaurantModel;
  menus: Array<{
    id: number;
    restaurantId: number;
    itemName: string;
    nameVn: string | null;
    description: string | null;
    price: string;
    isJapaneseFriendly: boolean;
    warningTags: string | null;
    imageUrl: string | null;
  }>;
  reviews: Array<{
    id: number;
    userId: number;
    userName: string | null;
    restaurantId: number;
    rating: number;
    ratingTaste: number | null;
    ratingCleanliness: number | null;
    ratingService: number | null;
    comment: string | null;
    imageUrl: string | null;
    createdAt: string;
  }>;
  ratingSummary: {
    averageRating: number | null;
    reviewCount: number;
  };
};
