import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewModel } from './models/review.model';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(): Promise<ReviewModel[]> {
    return this.reviewsRepository.findAll();
  }

  findByRestaurantId(restaurantId: number): Promise<ReviewModel[]> {
    return this.reviewsRepository.findByRestaurantId(restaurantId);
  }

  findById(id: number): Promise<ReviewModel | null> {
    return this.reviewsRepository.findById(id);
  }

  async create(data: CreateReviewDto): Promise<ReviewModel> {
    this.assertValidReview(data, true);
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant ${data.restaurantId} was not found`,
      );
    }

    if (data.userId === undefined) {
      throw new BadRequestException('userId is required');
    }

    const existing = await this.reviewsRepository.findByUserAndRestaurant(
      data.userId,
      data.restaurantId,
    );
    if (existing) {
      throw new ConflictException(
        'You have already reviewed this restaurant',
      );
    }

    return this.reviewsRepository.create({ ...data, userId: data.userId });
  }

  update(id: number, data: UpdateReviewDto): Promise<ReviewModel | null> {
    this.assertValidReview(data, false);
    return this.reviewsRepository.update(id, data);
  }

  delete(id: number): Promise<ReviewModel | null> {
    return this.reviewsRepository.delete(id);
  }

  private assertValidReview(
    data: CreateReviewDto | UpdateReviewDto,
    requireRating: boolean,
  ): void {
    if (requireRating && data.rating === undefined) {
      throw new BadRequestException('rating is required');
    }

    this.assertRating(data.rating, 'rating');
    this.assertRating(data.ratingTaste, 'ratingTaste');
    this.assertRating(data.ratingCleanliness, 'ratingCleanliness');
    this.assertRating(data.ratingService, 'ratingService');

    if (data.comment !== undefined && data.comment !== null) {
      const comment = String(data.comment);
      if (comment.length > 500) {
        throw new BadRequestException('comment must be at most 500 characters');
      }
    }
  }

  private assertRating(value: number | null | undefined, name: string): void {
    if (value === undefined || value === null) {
      return;
    }

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new BadRequestException(`${name} must be between 1 and 5`);
    }
  }
}
