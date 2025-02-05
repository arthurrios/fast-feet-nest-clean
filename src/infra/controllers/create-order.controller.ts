import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { CurrentUser } from 'src/infra/auth/current-user-decorator'
import { JwtAuthGuard } from 'src/infra/auth/jwt-auth.guard'
import { UserPayload } from 'src/infra/auth/jwt.strategy'
import { ZodValidationPipe } from 'src/infra/pipes/zod-validation-pipe'
import { PrismaService } from 'src/infra/prisma/prisma.service'
import { z } from 'zod'

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
  constructor(private prisma: PrismaService) {}

  @Post()
  // @HttpCode(201)
  // @UsePipes(new ZodValidationPipe(registerUserBodySchema))
  async handle(
    @Body(bodyValidationPipe) body: CreateOrderBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('recipientId') recipientId: string,
  ) {
    const { title, description, latitude, longitude, courierId } = body
    const userId = user.sub

    const slug = this.convertToSlug(title)

    const status = courierId ? OrderStatus.AWAITING : OrderStatus.PENDING

    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    })

    console.log(recipient)

    if (!recipient) {
      throw new NotFoundException('Recipient not found')
    }

    await this.prisma.order.create({
      data: {
        title,
        description,
        slug,
        latitude,
        status,
        longitude,
        courierId,
        recipientId,
      },
    })
  }

  private convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}
