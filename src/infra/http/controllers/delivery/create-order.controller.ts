import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

const recipientIdParamSchema = z.string().uuid().pipe(z.string())

const recipientIdValidationPipe = new ZodValidationPipe(recipientIdParamSchema)

const createOrderBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  coordinate: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  courierId: z.string().uuid().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(createOrderBodySchema)

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@Controller('/orders/:recipientId')
export class CreateOrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateOrderBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('recipientId', recipientIdValidationPipe) recipientId: string,
  ) {
    const { title, description, coordinate, courierId } = body
    const userId = user.sub

    const result = await this.createOrder.execute({
      requesterId: userId,
      title,
      description,
      coordinate,
      courierId,
      recipientId,
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
