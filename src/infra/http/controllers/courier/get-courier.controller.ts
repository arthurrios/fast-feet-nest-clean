import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { CourierPresenter } from '../../presenters/courier-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { GetCourierUseCase } from '@/domain/delivery/application/use-cases/get-courier'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

@Controller('/couriers/:id')
export class GetCourierController {
  constructor(private getCourier: GetCourierUseCase) {}

  @Get()
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getCourier.execute({
      requesterId: user.sub,
      courierId: id,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { courier } = result.value

    return { courier: CourierPresenter.toHTTP(courier) }
  }
}
