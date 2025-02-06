import { AuthorizationService } from '@/core/services/authorization-service'
import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository'
import { Module } from '@nestjs/common'

@Module({
  imports: [DatabaseModule],
  providers: [
    AuthorizationService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [AuthorizationService, UsersRepository],
})
export class UserModule {}
