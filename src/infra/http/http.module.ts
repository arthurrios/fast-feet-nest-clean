import { Module } from '@nestjs/common'
import { RegisterUserController } from './controllers/register-user.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateOrderController } from './controllers/delivery/create-order.controller'
import { DatabaseModule } from '../database/database.module'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { UserModule } from './controllers/user/user.module'
import { DeliveryModule } from './controllers/delivery/delivery.module'

@Module({
  imports: [DatabaseModule, UserModule, DeliveryModule],
  controllers: [
    RegisterUserController,
    AuthenticateController,
    CreateOrderController,
  ],
  providers: [CreateOrderUseCase],
})
export class HttpModule {}
