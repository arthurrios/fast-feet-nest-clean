import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { RegisterUserController } from './controllers/register-user.controller'
import { envSchema } from './env/env'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
  ],
  controllers: [RegisterUserController],
  providers: [PrismaService],
})
export class AppModule {}
