import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { CreateOrderController } from './create-order.controller'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { DatabaseModule } from '@/infra/database/database.module'
import { FetchOrdersNearbyController } from './fetch-orders-nearby.controller'
import { FetchOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/fetch-orders-nearby'
import { AuthorizationService } from '@/core/services/authorization-service'

@Module({
  imports: [UserModule, DatabaseModule],
  controllers: [CreateOrderController, FetchOrdersNearbyController],
  providers: [
    AuthorizationService,
    CreateOrderUseCase,
    FetchOrdersNearbyUseCase,
  ],
  exports: [CreateOrderUseCase, FetchOrdersNearbyUseCase],
})
export class DeliveryModule {}
