import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrderStatus } from '@/domain/delivery/@types/status'
import { UpdateOrderStatusUseCase } from '@/domain/delivery/application/use-cases/update-order-status'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

const orderIdParamSchema = z.string().uuid().pipe(z.string())

const orderIdValidationPipe = new ZodValidationPipe(orderIdParamSchema)

const updateOrderStatusBodySchema = z.object({
  courierId: z.string().uuid().optional(),
  status: z.nativeEnum(OrderStatus),
  attachmentsIds: z.array(z.string().uuid()),
})

const bodyValidationPipe = new ZodValidationPipe(updateOrderStatusBodySchema)

type UpdateOrderStatusBodySchema = z.infer<typeof updateOrderStatusBodySchema>

@Controller('/orders/:orderId/status')
export class UpdateOrderStatusController {
  constructor(private updateOrderStatus: UpdateOrderStatusUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: UpdateOrderStatusBodySchema,
    @Param('orderId', orderIdValidationPipe) orderId: string,
  ) {
    const { status, courierId, attachmentsIds } = body

    const result = await this.updateOrderStatus.execute({
      courierId,
      status,
      orderId,
      attachmentsIds,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
