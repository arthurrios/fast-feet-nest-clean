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
import { UserDeliveriesRepository } from '@/domain/user/application/repositories/user-deliveries-repository'
import { PrismaUserDeliveriesRepository } from './prisma/repositories/prisma-user-deliveries-repository'
import { OrderAttachmentsRepository } from '@/domain/delivery/application/repository/order-attachments-repository'
import { AttachmentsRepository } from '@/domain/delivery/application/repository/attachments-repository'

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
    {
      provide: UserDeliveriesRepository,
      useClass: PrismaUserDeliveriesRepository,
    },
    {
      provide: OrderAttachmentsRepository,
      useClass: PrismaOrderAttachmentsRepository,
    },
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    }
  ],
  exports: [
    PrismaService,
    OrdersRepository,
    CouriersRepository,
    RecipientsRepository,
    UsersRepository,
    UserDeliveriesRepository,
    OrderAttachmentsRepository,
    AttachmentsRepository,
  ],
})
export class DatabaseModule {}
