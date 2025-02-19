import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { OrderPresenter } from '../../presenters/order-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { GetOrderUseCase } from '@/domain/delivery/application/use-cases/get-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { z } from 'zod'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'
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

@ApiTags('Orders')
@Controller('/orders/:id')
export class GetOrderController {
  constructor(private getOrder: GetOrderUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch a specific order by ID',
    description:
      'Retrieves a specific order by its unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the order to fetch.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully.',
    schema: zodToOpenApiSchema(
      z.object({
        order: orderResponseSchema,
      }),
      {
        order: {
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
      },
    ),
  })
  @ApiResponse(
    notFoundResponse(
      'Order with ID "123e4567-e89b-12d3-a456-426614174000" not found.',
    ),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getOrder.execute({
      requesterId: user.sub,
      orderId: id,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { order } = result.value
    return { order: OrderPresenter.toHTTP(order) }
  }
}
