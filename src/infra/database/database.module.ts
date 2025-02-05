import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaOrdersRepository } from './prisma/repositories/prisma-orders-repository'
import { PrismaOrderAttachmentsRepository } from './prisma/repositories/prisma-order-attachments-repository'
import { PrismaCouriersRepository } from './prisma/repositories/prisma-couriers-repository'
import { PrismaRecipientRepository } from './prisma/repositories/prisma-recipients-repository'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'

@Module({
  providers: [
    PrismaService,
    PrismaOrdersRepository,
    PrismaOrderAttachmentsRepository,
    PrismaCouriersRepository,
    PrismaRecipientRepository,
    PrismaAttachmentsRepository,
  ],
  exports: [
    PrismaService,
    PrismaOrdersRepository,
    PrismaOrderAttachmentsRepository,
    PrismaCouriersRepository,
    PrismaRecipientRepository,
    PrismaAttachmentsRepository,
  ],
})
export class DatabaseModule {}
