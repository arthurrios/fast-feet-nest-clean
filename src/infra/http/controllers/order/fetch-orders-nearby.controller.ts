import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { FetchOrdersNearbyUseCase } from '@/domain/delivery/application/use-cases/fetch-orders-nearby'
import { OrderPresenter } from '../../presenters/order-presenter'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'

const orderResponseSchema = z.object({
  id: z.string().describe('The unique identifier of the order'),
  title: z.string().describe('The title of the order'),
  description: z.string().describe('The description of the order'),
  coordinate: z
    .object({
      latitude: z.number().describe('The latitude of the delivery location'),
      longitude: z.number().describe('The longitude of the delivery location'),
    })
    .describe('The geographic coordinates of the delivery location'),
  slug: z.string().describe('The slug (unique identifier) of the order'),
  recipientId: z.string().describe('The unique identifier of the recipient'),
  courierId: z
    .string()
    .optional()
    .describe(
      'The unique identifier of the courier assigned to the order (optional)',
    ),
  status: z.string().describe('The current status of the order'),
  createdAt: z.string().describe('The creation timestamp of the order record'),
  updatedAt: z
    .string()
    .describe('The last update timestamp of the order record'),
})

const fetchOrdersNearbyQuerySchema = z.object({
  latitude: z.coerce
    .number()
    .refine((value) => Math.abs(value) <= 90)
    .describe("The latitude of the user's location (-90 to 90)"),
  longitude: z.coerce
    .number()
    .refine((value) => Math.abs(value) <= 180)
    .describe("The longitude of the user's location (-180 to 180)"),
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1))
    .describe('The page number for pagination (default: 1)'),
})
const queryValidationPipe = new ZodValidationPipe(fetchOrdersNearbyQuerySchema)
type FetchOrdersNearbyQuerySchema = z.infer<typeof fetchOrdersNearbyQuerySchema>

@ApiTags('Orders')
@Controller('/orders/nearby')
@UseGuards(JwtAuthGuard)
export class FetchOrdersNearbyController {
  constructor(private fetchOrdersNearby: FetchOrdersNearbyUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch nearby orders',
    description:
      'Retrieves a paginated list of orders near the specified geographic coordinates. Requires authentication.',
  })
  @ApiQuery({
    name: 'latitude',
    type: 'number',
    description: "The latitude of the user's location (-90 to 90).",
    example: -23.5505,
    required: true,
  })
  @ApiQuery({
    name: 'longitude',
    type: 'number',
    description: "The longitude of the user's location (-180 to 180).",
    example: -46.6333,
    required: true,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'The page number for pagination (default: 1).',
    example: 1,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Nearby orders retrieved successfully.',
    schema: zodToOpenApiSchema(
      z.object({
        orders: z.array(orderResponseSchema),
      }),
      {
        orders: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Urgent Delivery',
            description: 'Deliver documents to the main office.',
            coordinate: {
              latitude: -23.5505,
              longitude: -46.6333,
            },
            slug: 'urgent-delivery-123',
            recipientId: 'abcdef12-3456-7890-abcd-ef1234567890',
            courierId: '987e6543-e21b-12d3-a456-426614174001',
            status: 'PENDING',
            createdAt: '2023-10-01T12:00:00Z',
            updatedAt: '2023-10-01T12:00:00Z',
          },
        ],
      },
    ),
  })
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
