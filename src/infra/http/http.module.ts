import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { UserModule } from './controllers/user/user.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { OrderModule } from './controllers/order/order.module'

@Module({
  imports: [DatabaseModule, UserModule, OrderModule, CryptographyModule],
  providers: [],
})
export class HttpModule {}
