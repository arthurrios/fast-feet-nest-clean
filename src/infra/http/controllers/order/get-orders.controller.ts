import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { GetOrdersUseCase } from '@/domain/delivery/application/use-cases/get-orders'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderPresenter } from '../../presenters/order-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'

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

export const pageQuerySchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))
export const pageQueryValidationPipe = new ZodValidationPipe(pageQuerySchema)
export type PageQuerySchema = z.infer<typeof pageQuerySchema>

@ApiTags('Orders')
@Controller('/orders')
export class GetOrdersController {
  constructor(private getOrders: GetOrdersUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch a paginated list of orders',
    description:
      'Retrieves a paginated list of orders. Only accessible by authorized admin users.',
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
    description: 'Orders retrieved successfully.',
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
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
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
