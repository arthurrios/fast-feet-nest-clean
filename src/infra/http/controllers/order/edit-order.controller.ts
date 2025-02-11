import {
  BadRequestException,
  Body,
  Controller,
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
import { EditOrderUseCase } from '@/domain/delivery/application/use-cases/edit-order'

const orderIdParamSchema = z.string().uuid().pipe(z.string())

const orderIdValidationPipe = new ZodValidationPipe(orderIdParamSchema)

const editOrderBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  recipientId: z.string().uuid(),
  coordinate: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  courierId: z.string().uuid().optional(),
  attachments: z.array(z.string().uuid()),
})

const bodyValidationPipe = new ZodValidationPipe(editOrderBodySchema)

type EditOrderBodySchema = z.infer<typeof editOrderBodySchema>

@Controller('/orders/:orderId')
export class EditOrderController {
  constructor(private editOrder: EditOrderUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: EditOrderBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('orderId', orderIdValidationPipe) orderId: string,
  ) {
    const { title, description, coordinate, recipientId, attachments } = body
    const userId = user.sub

    const result = await this.editOrder.execute({
      requesterId: userId,
      recipientId,
      attachmentsIds: attachments,
      title,
      description,
      coordinate,
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
