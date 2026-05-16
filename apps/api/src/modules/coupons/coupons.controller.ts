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
import { Public } from '../../common/auth/decorators/public.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { CreateCouponDto } from './dtos/create-coupon.dto';
import type { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponOwnerGuard } from './guards/coupon-owner.guard';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Get('restaurant/:restaurantId')
  async findByRestaurantId(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return await this.couponsService.findByRestaurantId(restaurantId);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const coupon = await this.couponsService.findById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} was not found`);
    }
    return coupon;
  }

  @Roles('OWNER')
  @UseGuards(CouponOwnerGuard)
  @Post()
  async create(@Body() body: CreateCouponDto) {
    return await this.couponsService.create(body);
  }

  @Roles('OWNER')
  @UseGuards(CouponOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCouponDto,
  ) {
    const { restaurantId: _restaurantId, ...safeBody } = body;
    void _restaurantId;
    const coupon = await this.couponsService.update(id, safeBody);
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} was not found`);
    }
    return coupon;
  }

  @Roles('OWNER')
  @UseGuards(CouponOwnerGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const coupon = await this.couponsService.delete(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} was not found`);
    }
    return coupon;
  }
}
