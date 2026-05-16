export type UpdateReviewDto = {
  userId?: number;
  restaurantId?: number;
  rating?: number;
  ratingTaste?: number | null;
  ratingCleanliness?: number | null;
  ratingService?: number | null;
  comment?: string | null;
  imageUrl?: string | null;
};
