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
      include: { user: { select: { username: true } } },
      orderBy: { created_at: 'desc' },
    });

    return reviews.map((review) => this.toModel(review));
  }

  async findByRestaurantId(restaurantId: number): Promise<ReviewModel[]> {
    const reviews = await this.prisma.review.findMany({
      where: { restaurant_id: restaurantId },
      include: { user: { select: { username: true } } },
      orderBy: { created_at: 'desc' },
    });

    return reviews.map((review) => this.toModel(review));
  }

  async findById(id: number): Promise<ReviewModel | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: { select: { username: true } } },
    });
    return review ? this.toModel(review) : null;
  }

  async findByUserAndRestaurant(
    userId: number,
    restaurantId: number,
  ): Promise<ReviewModel | null> {
    const review = await this.prisma.review.findFirst({
      where: { user_id: userId, restaurant_id: restaurantId },
      include: { user: { select: { username: true } } },
    });
    return review ? this.toModel(review) : null;
  }

  async create(
    data: CreateReviewDto & { userId: number },
  ): Promise<ReviewModel> {
    const review = await this.prisma.review.create({
      include: { user: { select: { username: true } } },
      data: {
        user_id: data.userId,
        restaurant_id: data.restaurantId,
        rating: data.rating,
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
      include: { user: { select: { username: true } } },
      where: { id },
      data: {
        user_id: data.userId,
        restaurant_id: data.restaurantId,
        rating: data.rating,
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

    const review = await this.prisma.review.delete({
      where: { id },
      include: { user: { select: { username: true } } },
    });
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
    rating: number;
    rating_taste: number | null;
    rating_cleanliness: number | null;
    rating_service: number | null;
    comment: string | null;
    image_url: string | null;
    created_at: Date;
    user?: { username: string } | null;
  }): ReviewModel {
    return {
      id: review.id,
      userId: review.user_id,
      userName: review.user?.username ?? null,
      restaurantId: review.restaurant_id,
      rating: review.rating,
      ratingTaste: review.rating_taste,
      ratingCleanliness: review.rating_cleanliness,
      ratingService: review.rating_service,
      comment: review.comment,
      imageUrl: review.image_url,
      createdAt: review.created_at.toISOString(),
    };
  }
}
