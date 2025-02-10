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
import { OrderPresenter } from '../../presenters/order-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { GetOrderUseCase } from '@/domain/delivery/application/use-cases/get-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

@Controller('/orders/:id')
export class GetOrderController {
  constructor(private getOrder: GetOrderUseCase) {}

  @Get()
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getOrder.execute({
      requesterId: user.sub,
      orderId: id,
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

    const { order } = result.value

    return { order: OrderPresenter.toHTTP(order) }
  }
}
