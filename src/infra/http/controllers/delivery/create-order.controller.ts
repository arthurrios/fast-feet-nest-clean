import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'

const createOrderBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  courierId: z.string().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(createOrderBodySchema)

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@Controller('/orders/:recipientId')
@UseGuards(JwtAuthGuard)
export class CreateOrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateOrderBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('recipientId') recipientId: string,
  ) {
    const { title, description, latitude, longitude, courierId } = body
    const userId = user.sub

    await this.createOrder.execute({
      requesterId: userId,
      title,
      description,
      coordinate: {
        latitude,
        longitude,
      },
      courierId,
      recipientId,
    })
  }
}
