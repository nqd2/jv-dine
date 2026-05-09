import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('DIRECT_URL') ??
      this.configService.get<string>('DATABASE_URL');

    this.pool = new Pool({
      connectionString,
      ssl: this.configService.get<string>('NODE_ENV') === 'production',
    });
  }

  async checkConnection() {
    const result = await this.pool.query<{ ok: number }>('SELECT 1 as ok');
    return result.rows[0]?.ok === 1;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
