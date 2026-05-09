import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewModel } from './models/review.model';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  findAll(): Promise<ReviewModel[]> {
    return this.reviewsRepository.findAll();
  }

  findByRestaurantId(restaurantId: number): Promise<ReviewModel[]> {
    return this.reviewsRepository.findByRestaurantId(restaurantId);
  }

  findById(id: number): Promise<ReviewModel | null> {
    return this.reviewsRepository.findById(id);
  }

  create(data: CreateReviewDto): Promise<ReviewModel> {
    return this.reviewsRepository.create(data);
  }

  update(id: number, data: UpdateReviewDto): Promise<ReviewModel | null> {
    return this.reviewsRepository.update(id, data);
  }

  delete(id: number): Promise<ReviewModel | null> {
    return this.reviewsRepository.delete(id);
  }
}
