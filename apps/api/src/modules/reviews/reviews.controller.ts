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
} from '@nestjs/common';
import type { CreateReviewDto } from './dtos/create-review.dto';
import type { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll() {
    return await this.reviewsService.findAll();
  }

  @Get('restaurant/:restaurantId')
  async findByRestaurantId(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return await this.reviewsService.findByRestaurantId(restaurantId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findById(id);
    if (!review) {
      throw new NotFoundException(`Review ${id} was not found`);
    }
    return review;
  }

  @Post()
  async create(@Body() body: CreateReviewDto) {
    return await this.reviewsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
  ) {
    const review = await this.reviewsService.update(id, body);
    if (!review) {
      throw new NotFoundException(`Review ${id} was not found`);
    }
    return review;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.delete(id);
    if (!review) {
      throw new NotFoundException(`Review ${id} was not found`);
    }
    return review;
  }
}
