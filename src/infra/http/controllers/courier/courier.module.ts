import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { RegisterCourierUseCase } from '@/domain/delivery/application/use-cases/register-courier'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { RegisterCourierController } from './register-courier.controller'

@Module({
  imports: [DatabaseModule, UserModule, CryptographyModule],
  controllers: [RegisterCourierController],
  providers: [AuthorizationService, RegisterCourierUseCase],
  exports: [RegisterCourierUseCase],
})
export class CourierModule {}
