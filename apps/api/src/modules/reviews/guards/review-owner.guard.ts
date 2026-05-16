import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/auth.types';
import { ReviewsRepository } from '../reviews.repository';

@Injectable()
export class ReviewOwnerGuard implements CanActivate {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params: { id?: string };
    }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Review owner access required');
    }

    const reviewId = Number(request.params.id);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      throw new NotFoundException('Review was not found');
    }

    const review = await this.reviewsRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review ${reviewId} was not found`);
    }

    if (review.userId !== user.id) {
      throw new ForbiddenException('You do not own this review');
    }

    return true;
  }
}
