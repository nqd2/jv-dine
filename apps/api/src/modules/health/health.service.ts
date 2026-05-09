import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseHealth() {
    try {
      const result = await this.prismaService.$queryRaw<{ ok: number }[]>(
        Prisma.sql`SELECT 1 AS ok`,
      );
      const ok = result[0]?.ok === 1;
      return {
        status: ok ? 'ok' : 'error',
        database: ok ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      return {
        status: 'error',
        database: 'disconnected',
        message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
