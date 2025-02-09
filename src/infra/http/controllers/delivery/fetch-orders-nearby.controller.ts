import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { FetchOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/fetch-orders-nearby'
import { OrderPresenter } from '../../presenters/order-presenter'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

export const pageQueryValidationPipe = new ZodValidationPipe(
  pageQueryParamSchema,
)

export type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

const fetchOrdersNearbyCourierBodySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

const bodyValidationPipe = new ZodValidationPipe(
  fetchOrdersNearbyCourierBodySchema,
)

type FetchOrdersNearbyBodySchema = z.infer<
  typeof fetchOrdersNearbyCourierBodySchema
>

@Controller('/orders/nearby')
@UseGuards(JwtAuthGuard)
export class FetchOrdersNearbyController {
  constructor(private fetchOrdersNearby: FetchOrdersNearbyUseCase) {}

  @Get()
  async handle(
    @Body(bodyValidationPipe) body: FetchOrdersNearbyBodySchema,
    @Query('page', pageQueryValidationPipe) page: PageQueryParamSchema,
  ) {
    const { latitude, longitude } = body

    const result = await this.fetchOrdersNearby.execute({
      latitude,
      longitude,
      params: { page },
    })

    const orders = result.value?.orders ?? []

    return { orders: orders.map(OrderPresenter.toHTTP) }
  }
}
