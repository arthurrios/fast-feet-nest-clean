import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { DeleteOrderUseCase } from '@/domain/delivery/application/use-cases/delete-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'

@ApiTags('Orders')
@Controller('/orders/:orderId')
export class DeleteOrderController {
  constructor(private deleteOrder: DeleteOrderUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an order by ID',
    description:
      'Deletes an existing order by its unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    description: 'The unique identifier of the order to delete.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Order deleted successfully.',
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
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('orderId', new ZodValidationPipe(z.string().uuid())) orderId: string,
  ) {
    const userId = user.sub

    const result = await this.deleteOrder.execute({
      requesterId: userId,
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
