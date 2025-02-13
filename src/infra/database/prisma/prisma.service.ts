import { PrismaClient } from '@prisma/client'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'],
    })
  }

  async onModuleInit() {
    await this.$connect()
    console.log('✅ Connected to Neon PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect()
    console.log('🛑 Disconnected from Neon PostgreSQL');
  }
}
