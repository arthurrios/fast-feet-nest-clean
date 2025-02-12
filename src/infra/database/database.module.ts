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
import { UserLinkedEntityRepository } from '@/core/types/repositories/user-linked-entity-repository'
import { PrismaUserLinkedEntityRepository } from './prisma/repositories/prisma-user-linked-entity-repository'
import { USER_LINKED_ENTITY_REPOSITORIES } from '../../domain/delivery/application/repository/repositories.tokens'
import { UserLinkedEntity } from '@/core/shared/entities/user-linked-entity'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { PrismaNotificationsRepository } from './prisma/repositories/prisma-notifications-repository'
import { CacheModule } from '../cache/redis/cache.module'

@Module({
  imports: [CacheModule],
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
    },
    {
      provide: UserLinkedEntityRepository,
      useClass: PrismaUserLinkedEntityRepository,
    },
    {
      provide: USER_LINKED_ENTITY_REPOSITORIES,
      useFactory: (
        repository: UserLinkedEntityRepository<UserLinkedEntity>,
      ) => {
        return [repository]
      },
      inject: [UserLinkedEntityRepository],
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
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
    UserLinkedEntityRepository,
    USER_LINKED_ENTITY_REPOSITORIES,
    NotificationsRepository,
  ],
})
export class DatabaseModule {}
