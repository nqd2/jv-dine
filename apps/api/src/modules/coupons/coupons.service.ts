import { Injectable } from '@nestjs/common';
import { CouponModel } from './models/coupon.model';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponsRepository } from './coupons.repository';

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  findAll(): Promise<CouponModel[]> {
    return this.couponsRepository.findAll();
  }

  findByRestaurantId(restaurantId: number): Promise<CouponModel[]> {
    return this.couponsRepository.findByRestaurantId(restaurantId);
  }

  findById(id: number): Promise<CouponModel | null> {
    return this.couponsRepository.findById(id);
  }

  create(data: CreateCouponDto): Promise<CouponModel> {
    return this.couponsRepository.create(data);
  }

  update(id: number, data: UpdateCouponDto): Promise<CouponModel | null> {
    return this.couponsRepository.update(id, data);
  }

  delete(id: number): Promise<CouponModel | null> {
    return this.couponsRepository.delete(id);
  }
}
