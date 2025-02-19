import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CreateOrderUseCase } from '@/domain/delivery/application/use-cases/create-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'

import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'
import {
  Controller,
  Post,
  Body,
  Param,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger'

const createOrderBodySchema = z.object({
  title: z.string().describe('The title of the order'),
  description: z.string().describe('The description of the order'),
  coordinate: z
    .object({
      latitude: z.number().describe('The latitude of the delivery location'),
      longitude: z.number().describe('The longitude of the delivery location'),
    })
    .describe('The geographic coordinates of the delivery location'),
  courierId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'The unique identifier of the courier assigned to the order (optional)',
    ),
})

const bodyValidationPipe = new ZodValidationPipe(createOrderBodySchema)
type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@ApiTags('Orders')
@Controller('/orders/:recipientId')
export class CreateOrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a new order for a specific recipient. Only accessible by authorized users.',
  })
  @ApiParam({
    name: 'recipientId',
    type: 'string',
    description:
      'The unique identifier of the recipient for whom the order is created.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(createOrderBodySchema, {
      title: 'Urgent Delivery',
      description: 'Deliver documents to the main office.',
      coordinate: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
      courierId: '987e6543-e21b-12d3-a456-426614174001',
    }),
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully.',
  })
  @ApiResponse(
    notFoundResponse(
      'Recipient with ID "123e4567-e89b-12d3-a456-426614174000" not found.',
    ),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(
    badRequestResponse('Invalid input data. Please check the request body.'),
  )
  async handle(
    @Body(bodyValidationPipe) body: CreateOrderBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('recipientId', new ZodValidationPipe(z.string().uuid()))
    recipientId: string,
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
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
