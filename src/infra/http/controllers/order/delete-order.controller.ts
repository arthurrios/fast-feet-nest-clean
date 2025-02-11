import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { DeleteOrderUseCase } from '@/domain/delivery/application/use-cases/delete-order'

const orderIdParamSchema = z.string().uuid().pipe(z.string())

const orderIdValidationPipe = new ZodValidationPipe(orderIdParamSchema)

@Controller('/orders/:orderId')
export class DeleteOrderController {
  constructor(private deleteOrder: DeleteOrderUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('orderId', orderIdValidationPipe) orderId: string,
  ) {
    const userId = user.sub

    const result = await this.deleteOrder.execute({
      requesterId: userId,
      orderId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
