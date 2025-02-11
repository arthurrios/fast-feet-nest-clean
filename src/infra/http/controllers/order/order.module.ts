import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { CreateOrderController } from './create-order.controller'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { DatabaseModule } from '@/infra/database/database.module'
import { FetchOrdersNearbyController } from './fetch-orders-nearby.controller'
import { FetchOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/fetch-orders-nearby'
import { AuthorizationService } from '@/core/services/authorization-service'
import { GetOrderUseCase } from '@/domain/delivery/application/use-cases/get-order'
import { GetOrdersController } from './get-orders.controller'
import { GetOrdersUseCase } from '@/domain/delivery/application/use-cases/get-orders'
import { GetOrderController } from './get-order.controller'
import { EditOrderController } from './edit-order.controller'
import { EditOrderUseCase } from '@/domain/delivery/application/use-cases/edit-order'
import { DeleteOrderController } from './delete-order.controller'
import { DeleteOrderUseCase } from '@/domain/delivery/application/use-cases/delete-order'

@Module({
  imports: [UserModule, DatabaseModule],
  controllers: [
    CreateOrderController,
    FetchOrdersNearbyController,
    GetOrdersController,
    GetOrderController,
    EditOrderController,
    DeleteOrderController,
  ],
  providers: [
    AuthorizationService,
    CreateOrderUseCase,
    FetchOrdersNearbyUseCase,
    GetOrdersUseCase,
    GetOrderUseCase,
    EditOrderUseCase,
    DeleteOrderUseCase,
  ],
  exports: [
    CreateOrderUseCase,
    FetchOrdersNearbyUseCase,
    GetOrdersUseCase,
    GetOrderUseCase,
    EditOrderUseCase,
    DeleteOrderUseCase,
  ],
})
export class OrderModule {}
