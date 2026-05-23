import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  restaurantId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  ratingTaste?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  ratingCleanliness?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  ratingService?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
