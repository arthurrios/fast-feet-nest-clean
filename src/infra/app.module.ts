import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { RegisterUserController } from './controllers/register-user.controller'
import { envSchema } from './env/env'
import { AuthModule } from './auth/auth.module'
import { EnvModule } from './env/env.module'
import { EnvService } from './env/env.service'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateOrderController } from './controllers/create-order.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    EnvModule,
  ],
  controllers: [
    RegisterUserController,
    AuthenticateController,
    CreateOrderController,
  ],
  providers: [PrismaService, EnvService],
})
export class AppModule {}
