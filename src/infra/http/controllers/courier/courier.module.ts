import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { RegisterCourierUseCase } from '@/domain/delivery/application/use-cases/register-courier'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { RegisterCourierController } from './register-courier.controller'
import { GetCouriersController } from './get-couriers.controller'
import { GetCouriersUseCase } from '@/domain/delivery/application/use-cases/get-couriers'
import { GetCourierController } from './get-courier.controller'
import { GetCourierUseCase } from '@/domain/delivery/application/use-cases/get-courier'
import { EditCourierController } from './edit-courier.controller'
import { EditCourierUseCase } from '@/domain/delivery/application/use-cases/edit-courier'

@Module({
  imports: [DatabaseModule, UserModule, CryptographyModule],
  controllers: [
    RegisterCourierController,
    GetCouriersController,
    GetCourierController,
    EditCourierController,
  ],
  providers: [
    AuthorizationService,
    RegisterCourierUseCase,
    GetCouriersUseCase,
    GetCourierUseCase,
    EditCourierUseCase,
  ],
  exports: [
    RegisterCourierUseCase,
    GetCouriersUseCase,
    GetCourierUseCase,
    EditCourierUseCase,
  ],
})
export class CourierModule {}
