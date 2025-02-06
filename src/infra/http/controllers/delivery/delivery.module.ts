import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { CreateOrderController } from './create-order.controller'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { DatabaseModule } from '@/infra/database/database.module'

@Module({
  imports: [UserModule, DatabaseModule],
  controllers: [CreateOrderController],
  providers: [CreateOrderUseCase],
})
export class DeliveryModule {}
