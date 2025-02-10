import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { UserModule } from './controllers/user/user.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { OrderModule } from './controllers/order/order.module'
import { CourierModule } from './controllers/courier/courier.module'
import { RecipientModule } from './controllers/recipient/recipient.module'

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    OrderModule,
    CourierModule,
    RecipientModule,
    CryptographyModule,
  ],
  providers: [],
})
export class HttpModule {}
