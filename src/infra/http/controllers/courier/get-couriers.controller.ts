import { GetCouriersUseCase } from '@/domain/delivery/application/use-cases/get-couriers'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import {
  PageQuerySchema,
  pageQueryValidationPipe,
} from '../order/get-orders.controller'
import { CourierPresenter } from '../../presenters/courier-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'

@Controller('/couriers')
export class GetCouriersController {
  constructor(private getCouriers: GetCouriersUseCase) {}

  @Get()
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page', pageQueryValidationPipe) page: PageQuerySchema,
  ) {
    const result = await this.getCouriers.execute({
      requesterId: user.sub,
      params: { page },
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const couriers = result.value.couriers

    return { couriers: couriers.map(CourierPresenter.toHTTP) }
  }
}
