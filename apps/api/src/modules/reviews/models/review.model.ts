export type ReviewModel = {
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
};
