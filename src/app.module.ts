import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { RegisterUserController } from './controllers/register-user.controller'

@Module({
  controllers: [RegisterUserController],
  providers: [PrismaService],
})
export class AppModule {}
