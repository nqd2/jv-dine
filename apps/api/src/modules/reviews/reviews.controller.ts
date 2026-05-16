import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Public } from '../../common/auth/decorators/public.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/auth/auth.types';
import type { CreateReviewDto } from './dtos/create-review.dto';
import type { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewOwnerGuard } from './guards/review-owner.guard';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.reviewsService.findAll();
  }

  @Public()
  @Get('restaurant/:restaurantId')
  async findByRestaurantId(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return await this.reviewsService.findByRestaurantId(restaurantId);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findById(id);
    if (!review) {
      throw new NotFoundException(`Review ${id} was not found`);
    }
    return review;
  }

  @Roles('USER', 'OWNER')
  @Post()
  async create(
    @Body() body: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { userId: _clientUserId, ...safeBody } = body;
    void _clientUserId;
    return await this.reviewsService.create({
      ...safeBody,
      userId: user.id,
    });
  }

  @Roles('USER', 'OWNER')
  @UseGuards(ReviewOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
  ) {
    const {
      userId: _clientUserId,
      restaurantId: _clientRestaurantId,
      ...safeBody
    } = body;
    void _clientUserId;
    void _clientRestaurantId;
    const review = await this.reviewsService.update(id, safeBody);
    if (!review) {
      throw new NotFoundException(`Review ${id} was not found`);
    }
    return review;
  }

  @Roles('USER', 'OWNER')
  @UseGuards(ReviewOwnerGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.delete(id);
    if (!review) {
      throw new NotFoundException(`Review ${id} was not found`);
    }
    return review;
  }
}
