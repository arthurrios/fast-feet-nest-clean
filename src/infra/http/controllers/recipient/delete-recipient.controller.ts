import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { DeleteRecipientUseCase } from '@/domain/delivery/application/use-cases/delete-recipient';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { badRequestResponse } from '@/swagger/responses/bad-request.response';
import { notFoundResponse } from '@/swagger/responses/not-found.response';
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response';

@ApiTags('Recipients')
@Controller('/recipients/:id')
export class DeleteRecipientController {
  constructor(private deleteRecipient: DeleteRecipientUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a specific recipient by ID',
    description:
      'Deletes a specific recipient by their unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the recipient to delete.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Recipient deleted successfully.',
  })
  @ApiResponse(
    notFoundResponse('Recipient with ID "123e4567-e89b-12d3-a456-426614174000" not found.'),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
  async handle(@Param('id') recipientId: string, @CurrentUser() user: UserPayload) {
    const result = await this.deleteRecipient.execute({
      requesterId: user.sub,
      recipientId,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}