import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { FetchOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/fetch-orders-nearby'
import { OrderPresenter } from '../../presenters/order-presenter'

const fetchOrdersNearbyQuerySchema = z.object({
  latitude: z.coerce.number().refine((value) => {
    return Math.abs(value) <= 90
  }),
  longitude: z.coerce.number().refine((value) => {
    return Math.abs(value) <= 180
  }),
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
})

const queryValidationPipe = new ZodValidationPipe(fetchOrdersNearbyQuerySchema)

type FetchOrdersNearbyQuerySchema = z.infer<typeof fetchOrdersNearbyQuerySchema>

@Controller('/orders/nearby')
export class FetchOrdersNearbyController {
  constructor(private fetchOrdersNearby: FetchOrdersNearbyUseCase) {}

  @Get()
  async handle(
    @Query(queryValidationPipe) query: FetchOrdersNearbyQuerySchema,
  ) {
    const { latitude, longitude, page } = query

    const result = await this.fetchOrdersNearby.execute({
      latitude,
      longitude,
      params: { page },
    })

    const orders = result.value?.orders ?? []

    return { orders: orders.map(OrderPresenter.toHTTP) }
  }
}
