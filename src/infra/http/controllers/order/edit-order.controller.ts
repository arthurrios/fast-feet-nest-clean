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
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { EditOrderUseCase } from '@/domain/delivery/application/use-cases/edit-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
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

const editOrderBodySchema = z.object({
  title: z.string().describe('The title of the order'),
  description: z.string().describe('The description of the order'),
  recipientId: z
    .string()
    .uuid()
    .describe('The unique identifier of the recipient'),
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
  attachments: z
    .array(z.string().uuid())
    .describe('An array of attachment IDs associated with the order'),
})

const bodyValidationPipe = new ZodValidationPipe(editOrderBodySchema)
type EditOrderBodySchema = z.infer<typeof editOrderBodySchema>

@ApiTags('Orders')
@Controller('/orders/:orderId')
export class EditOrderController {
  constructor(private editOrder: EditOrderUseCase) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Edit an existing order',
    description:
      'Updates the details of an existing order by its unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    description: 'The unique identifier of the order to edit.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(editOrderBodySchema, {
      title: 'Updated Delivery',
      description: 'Deliver updated documents to the main office.',
      recipientId: 'abcdef12-3456-7890-abcd-ef1234567890',
      coordinate: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
      courierId: '987e6543-e21b-12d3-a456-426614174001',
      attachments: ['attachment1-id', 'attachment2-id'],
    }),
  })
  @ApiResponse({
    status: 204,
    description: 'Order updated successfully.',
  })
  @ApiResponse(
    notFoundResponse(
      'Order with ID "123e4567-e89b-12d3-a456-426614174000" not found.',
    ),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(
    badRequestResponse('Invalid input data. Please check the request body.'),
  )
  async handle(
    @Body(bodyValidationPipe) body: EditOrderBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('orderId', new ZodValidationPipe(z.string().uuid())) orderId: string,
  ) {
    const { title, description, coordinate, recipientId, attachments } = body
    const userId = user.sub

    const result = await this.editOrder.execute({
      requesterId: userId,
      recipientId,
      attachmentsIds: attachments,
      title,
      description,
      coordinate,
      orderId,
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
