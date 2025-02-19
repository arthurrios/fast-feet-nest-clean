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
import { DeleteCourierUseCase } from '@/domain/delivery/application/use-cases/delete-courier'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'

@ApiTags('Couriers')
@Controller('/couriers/:id')
export class DeleteCourierController {
  constructor(private deleteCourier: DeleteCourierUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a specific courier by ID',
    description:
      'Deletes a specific courier by their unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the courier to delete.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Courier deleted successfully.',
  })
  @ApiResponse(
    notFoundResponse(
      'Courier with ID "123e4567-e89b-12d3-a456-426614174000" not found.',
    ),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
  async handle(
    @Param('id') courierId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deleteCourier.execute({
      requesterId: user.sub,
      courierId,
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
