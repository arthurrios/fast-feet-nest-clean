import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaOrdersRepository } from './prisma/repositories/prisma-orders-repository'
import { PrismaOrderAttachmentsRepository } from './prisma/repositories/prisma-order-attachments-repository'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
import { OrdersRepository } from '@/domain/delivery/application/repository/orders-repository'
import { CouriersRepository } from '@/domain/delivery/application/repository/courier-repository'
import { PrismaCouriersRepository } from './prisma/repositories/prisma-couriers-repository'
import { RecipientsRepository } from '@/domain/delivery/application/repository/recipient-repository'
import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'
import { PrismaRecipientsRepository } from './prisma/repositories/prisma-recipients-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: OrdersRepository,
      useClass: PrismaOrdersRepository,
    },
    {
      provide: CouriersRepository,
      useClass: PrismaCouriersRepository,
    },
    {
      provide: RecipientsRepository,
      useClass: PrismaRecipientsRepository,
    },
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    PrismaOrderAttachmentsRepository,
    PrismaAttachmentsRepository,
  ],
  exports: [
    PrismaService,
    OrdersRepository,
    CouriersRepository,
    RecipientsRepository,
    UsersRepository,
    PrismaOrderAttachmentsRepository,
    PrismaAttachmentsRepository,
  ],
})
export class DatabaseModule {}
