import { EnvService } from '@/infra/env/env.service'
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis

  constructor(envService: EnvService) {
    this.client = new Redis(envService.get('REDIS_URL'), {
      tls: {},
    })

    this.client.on('connect', () =>
      console.log('✅ Redis connected to Upstash'),
    )
    this.client.on('error', (err) => console.error('❌ Redis error', err))
  }

  getClient(): Redis {
    return this.client
  }

  async onModuleDestroy() {
    await this.client.quit()
    console.log('🛑 Redis connection closed')
  }
}
