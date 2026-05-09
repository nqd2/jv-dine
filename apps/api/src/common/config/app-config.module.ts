import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './env.config';

@Module({
  imports: [ConfigModule.forRoot(envConfig)],
})
export class AppConfigModule {}
