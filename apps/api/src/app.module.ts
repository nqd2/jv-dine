import { Module } from '@nestjs/common';
import { AuthGuardsModule } from './common/auth/auth-guards.module';
import { AppConfigModule } from './common/config/app-config.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { HealthModule } from './modules/health/health.module';
import { MenusModule } from './modules/menus/menus.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RolesModule } from './modules/roles/roles.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AppConfigModule,
    AuthGuardsModule,
    PrismaModule,
    AuthModule,
    HealthModule,
    RolesModule,
    UsersModule,
    RestaurantsModule,
    MenusModule,
    CouponsModule,
    ReviewsModule,
    NotificationsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
