import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewOwnerGuard } from './guards/review-owner.guard';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, ReviewOwnerGuard],
  exports: [ReviewsService],
})
export class ReviewsModule {}
