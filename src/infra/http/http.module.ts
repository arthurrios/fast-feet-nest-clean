import { Module } from '@nestjs/common'
import { RegisterUserController } from './controllers/register-user.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateOrderController } from './controllers/create-order.controller'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [
    RegisterUserController,
    AuthenticateController,
    CreateOrderController,
  ],
  providers: [PrismaService],
})
export class HttpModule {}
