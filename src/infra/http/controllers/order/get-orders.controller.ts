import { GetOrdersUseCase } from '@/domain/delivery/application/use-cases/get-orders'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { OrderPresenter } from '../../presenters/order-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'

export const pageQuerySchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

export const pageQueryValidationPipe = new ZodValidationPipe(pageQuerySchema)

export type PageQuerySchema = z.infer<typeof pageQuerySchema>

@Controller('/orders')
export class GetOrdersController {
  constructor(private getOrders: GetOrdersUseCase) {}

  @Get()
  async handle(
    @Query('page', pageQueryValidationPipe) page: PageQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.getOrders.execute({
      requesterId: user.sub,
      page,
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

    const { orders } = result.value

    return { orders: orders.map(OrderPresenter.toHTTP) }
  }
}
