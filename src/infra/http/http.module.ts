import { Module } from '@nestjs/common'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateOrderController } from './controllers/delivery/create-order.controller'
import { DatabaseModule } from '../database/database.module'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { UserModule } from './controllers/user/user.module'
import { DeliveryModule } from './controllers/delivery/delivery.module'
import { CryptographyModule } from '../cryptography/cryptography.module'

@Module({
  imports: [DatabaseModule, UserModule, DeliveryModule, CryptographyModule],
  providers: [],
})
export class HttpModule {}
