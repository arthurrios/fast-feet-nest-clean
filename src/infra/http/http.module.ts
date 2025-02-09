import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { UserModule } from './controllers/user/user.module'
import { DeliveryModule } from './controllers/delivery/delivery.module'
import { CryptographyModule } from '../cryptography/cryptography.module'

@Module({
  imports: [DatabaseModule, UserModule, DeliveryModule, CryptographyModule],
  providers: [],
})
export class HttpModule {}
