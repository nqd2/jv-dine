import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponModel, CouponStatsModel } from './models/coupon.model';

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
      orderBy: { id: 'desc' },
    });

    return coupons.map((coupon) => this.toModel(coupon));
  }

  async getStatsByRestaurantId(
    restaurantId: number,
  ): Promise<CouponStatsModel> {
    const coupons = await this.prisma.coupon.findMany({
      where: { restaurant_id: restaurantId },
    });

    return {
      total: coupons.length,
      active: coupons.filter((c) => c.status === 'active').length,
      paused: coupons.filter((c) => c.status === 'paused').length,
      totalViews: coupons.reduce((s, c) => s + c.views_count, 0),
      totalUsages: coupons.reduce((s, c) => s + c.usages_count, 0),
    };
  }

  async findById(id: number): Promise<CouponModel | null> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    return coupon ? this.toModel(coupon) : null;
  }

  async create(data: CreateCouponDto): Promise<CouponModel> {
    const discountValue = data.discountValue;
    const discountRate =
      data.discountRate ??
      (data.discountType === 'percentage' ? discountValue : 0);

    const coupon = await this.prisma.coupon.create({
      data: {
        restaurant_id: data.restaurantId,
        code: data.code,
        discount_rate: discountRate,
        name_ja: data.nameJa ?? null,
        name_vn: data.nameVn ?? null,
        description_ja: data.descriptionJa ?? null,
        description_vn: data.descriptionVn ?? null,
        discount_type: data.discountType ?? 'percentage',
        discount_value: discountValue,
        start_date: data.startDate ? new Date(data.startDate) : null,
        expiry_date: new Date(data.expiryDate),
        usage_limit: data.usageLimit ?? null,
        status: data.status ?? 'active',
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
        name_ja: data.nameJa,
        name_vn: data.nameVn,
        description_ja: data.descriptionJa,
        description_vn: data.descriptionVn,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date:
          data.startDate === undefined ? undefined : new Date(data.startDate),
        expiry_date:
          data.expiryDate === undefined ? undefined : new Date(data.expiryDate),
        usage_limit: data.usageLimit,
        status: data.status,
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
    name_ja: string | null;
    name_vn: string | null;
    description_ja: string | null;
    description_vn: string | null;
    discount_type: string;
    discount_value: number;
    start_date: Date | null;
    expiry_date: Date;
    usage_limit: number | null;
    status: string;
    views_count: number;
    usages_count: number;
  }): CouponModel {
    return {
      id: coupon.id,
      restaurantId: coupon.restaurant_id,
      code: coupon.code,
      discountRate: coupon.discount_rate,
      nameJa: coupon.name_ja,
      nameVn: coupon.name_vn,
      descriptionJa: coupon.description_ja,
      descriptionVn: coupon.description_vn,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      startDate: coupon.start_date?.toISOString() ?? null,
      expiryDate: coupon.expiry_date.toISOString(),
      usageLimit: coupon.usage_limit,
      status: coupon.status,
      viewsCount: coupon.views_count,
      usagesCount: coupon.usages_count,
    };
  }
}
