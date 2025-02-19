import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrderStatus } from '@/domain/delivery/@types/status'
import { UpdateOrderStatusUseCase } from '@/domain/delivery/application/use-cases/update-order-status'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'

// Define the Zod schema for the request body
const updateOrderStatusBodySchema = z.object({
  courierId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'The unique identifier of the courier assigned to the order (optional)',
    ),
  status: z.nativeEnum(OrderStatus).describe('The new status of the order'),
  attachmentsIds: z
    .array(z.string().uuid())
    .optional()
    .describe(
      'An array of attachment IDs associated with the order (optional)',
    ),
})

const bodyValidationPipe = new ZodValidationPipe(updateOrderStatusBodySchema)
type UpdateOrderStatusBodySchema = z.infer<typeof updateOrderStatusBodySchema>

@ApiTags('Orders')
@Controller('/orders/:orderId/status')
export class UpdateOrderStatusController {
  constructor(private updateOrderStatus: UpdateOrderStatusUseCase) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Update the status of an order',
    description:
      'Updates the status of an existing order by its unique ID. Only accessible by authorized users.',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    description: 'The unique identifier of the order to update.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(updateOrderStatusBodySchema, {
      courierId: '987e6543-e21b-12d3-a456-426614174001',
      status: 'DELIVERED',
      attachmentsIds: ['attachment1-id', 'attachment2-id'],
    }),
  })
  @ApiResponse({
    status: 204,
    description: 'Order status updated successfully.',
  })
  @ApiResponse(
    notFoundResponse(
      'Order with ID "123e4567-e89b-12d3-a456-426614174000" not found.',
    ),
  )
  @ApiResponse(unauthorizedResponse('Courier is not assigned to this order'))
  @ApiResponse(
    badRequestResponse('Invalid input data. Please check the request body.'),
  )
  async handle(
    @Body(bodyValidationPipe) body: UpdateOrderStatusBodySchema,
    @Param('orderId', new ZodValidationPipe(z.string().uuid())) orderId: string,
  ) {
    const { status, courierId, attachmentsIds } = body

    const result = await this.updateOrderStatus.execute({
      courierId,
      status,
      orderId,
      attachmentsIds: attachmentsIds ?? [],
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
