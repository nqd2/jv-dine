import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponModel } from './models/coupon.model';

@Injectable()
export class CouponsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CouponModel[]> {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { id: 'asc' },
    });

    return coupons.map((coupon) => this.toModel(coupon));
  }

  async findByRestaurantId(restaurantId: number): Promise<CouponModel[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { id: 'asc' },
    });

    return coupons.map((coupon) => this.toModel(coupon));
  }

  async findById(id: number): Promise<CouponModel | null> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    return coupon ? this.toModel(coupon) : null;
  }

  async create(data: CreateCouponDto): Promise<CouponModel> {
    const coupon = await this.prisma.coupon.create({
      data: {
        restaurant_id: data.restaurantId,
        code: data.code,
        discount_rate: data.discountRate,
        expiry_date: new Date(data.expiryDate),
      },
    });

    return this.toModel(coupon);
  }

  async update(id: number, data: UpdateCouponDto): Promise<CouponModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        restaurant_id: data.restaurantId,
        code: data.code,
        discount_rate: data.discountRate,
        expiry_date:
          data.expiryDate === undefined ? undefined : new Date(data.expiryDate),
      },
    });

    return this.toModel(coupon);
  }

  async delete(id: number): Promise<CouponModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const coupon = await this.prisma.coupon.delete({ where: { id } });
    return this.toModel(coupon);
  }

  private async exists(id: number): Promise<boolean> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      select: { id: true },
    });
    return coupon !== null;
  }

  private toModel(coupon: {
    id: number;
    restaurant_id: number;
    code: string;
    discount_rate: number;
    expiry_date: Date;
  }): CouponModel {
    return {
      id: coupon.id,
      restaurantId: coupon.restaurant_id,
      code: coupon.code,
      discountRate: coupon.discount_rate,
      expiryDate: coupon.expiry_date.toISOString(),
    };
  }
}
