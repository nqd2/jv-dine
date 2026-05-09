import type { ConfigModuleOptions } from '@nestjs/config';

export const envFilePath = ['../../.env', '.env'];

export const envConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath,
};
