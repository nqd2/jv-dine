import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewModel } from './models/review.model';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReviewModel[]> {
    const reviews = await this.prisma.review.findMany({
      orderBy: { created_at: 'desc' },
    });

    return reviews.map((review) => this.toModel(review));
  }

  async findByRestaurantId(restaurantId: number): Promise<ReviewModel[]> {
    const reviews = await this.prisma.review.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { created_at: 'desc' },
    });

    return reviews.map((review) => this.toModel(review));
  }

  async findById(id: number): Promise<ReviewModel | null> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    return review ? this.toModel(review) : null;
  }

  async create(data: CreateReviewDto): Promise<ReviewModel> {
    const review = await this.prisma.review.create({
      data: {
        user_id: data.userId,
        restaurant_id: data.restaurantId,
        rating_taste: data.ratingTaste,
        rating_cleanliness: data.ratingCleanliness,
        rating_service: data.ratingService,
        comment: data.comment,
        image_url: data.imageUrl,
      },
    });

    return this.toModel(review);
  }

  async update(id: number, data: UpdateReviewDto): Promise<ReviewModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const review = await this.prisma.review.update({
      where: { id },
      data: {
        user_id: data.userId,
        restaurant_id: data.restaurantId,
        rating_taste: data.ratingTaste,
        rating_cleanliness: data.ratingCleanliness,
        rating_service: data.ratingService,
        comment: data.comment,
        image_url: data.imageUrl,
      },
    });

    return this.toModel(review);
  }

  async delete(id: number): Promise<ReviewModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const review = await this.prisma.review.delete({ where: { id } });
    return this.toModel(review);
  }

  private async exists(id: number): Promise<boolean> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { id: true },
    });
    return review !== null;
  }

  private toModel(review: {
    id: number;
    user_id: number;
    restaurant_id: number;
    rating_taste: number;
    rating_cleanliness: number;
    rating_service: number;
    comment: string | null;
    image_url: string | null;
    created_at: Date;
  }): ReviewModel {
    return {
      id: review.id,
      userId: review.user_id,
      restaurantId: review.restaurant_id,
      ratingTaste: review.rating_taste,
      ratingCleanliness: review.rating_cleanliness,
      ratingService: review.rating_service,
      comment: review.comment,
      imageUrl: review.image_url,
      createdAt: review.created_at.toISOString(),
    };
  }
}
