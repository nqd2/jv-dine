export type CreateReviewDto = {
  userId: number;
  restaurantId: number;
  ratingTaste: number;
  ratingCleanliness: number;
  ratingService: number;
  comment?: string | null;
  imageUrl?: string | null;
};
