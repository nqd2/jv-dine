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
import type { CreateCouponDto } from './dtos/create-coupon.dto';
import type { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  async findAll() {
    return await this.couponsService.findAll();
  }

  @Get('restaurant/:restaurantId')
  async findByRestaurantId(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return await this.couponsService.findByRestaurantId(restaurantId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const coupon = await this.couponsService.findById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} was not found`);
    }
    return coupon;
  }

  @Post()
  async create(@Body() body: CreateCouponDto) {
    return await this.couponsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCouponDto,
  ) {
    const coupon = await this.couponsService.update(id, body);
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} was not found`);
    }
    return coupon;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const coupon = await this.couponsService.delete(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} was not found`);
    }
    return coupon;
  }
}
