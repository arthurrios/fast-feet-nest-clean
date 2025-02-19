import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { RecipientPresenter } from '../../presenters/recipient-presenter';
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error';
import { GetRecipientUseCase } from '@/domain/delivery/application/use-cases/get-recipient';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { z } from 'zod';
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema';
import { badRequestResponse } from '@/swagger/responses/bad-request.response';
import { notFoundResponse } from '@/swagger/responses/not-found.response';
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response';

// Define a Zod schema for the recipient response
const recipientResponseSchema = z.object({
  id: z.string().describe('The unique identifier of the recipient'),
  name: z.string().describe("The recipient's full name"),
  cpf: z.string().describe("The recipient's CPF in formatted form (e.g., 123.456.789-01)"),
  email: z.string().email().describe("The recipient's email address"),
  createdAt: z.string().describe('The creation timestamp of the recipient record'),
  updatedAt: z.string().describe('The last update timestamp of the recipient record'),
});

@ApiTags('Recipients')
@Controller('/recipients/:id')
export class GetRecipientController {
  constructor(private getRecipient: GetRecipientUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch a specific recipient by ID',
    description:
      'Retrieves a specific recipient by their unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the recipient to fetch.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Recipient retrieved successfully.',
    schema: zodToOpenApiSchema(
      z.object({
        recipient: recipientResponseSchema,
      }),
      {
        recipient: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          cpf: '123.456.789-01',
          email: 'john.doe@example.com',
          createdAt: '2023-10-01T12:00:00Z',
          updatedAt: '2023-10-01T12:00:00Z',
        },
      }
    ),
  })
  @ApiResponse(
    notFoundResponse('Recipient with ID "123e4567-e89b-12d3-a456-426614174000" not found.'),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getRecipient.execute({
      requesterId: user.sub,
      recipientId: id,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { recipient } = result.value;
    return { recipient: RecipientPresenter.toHTTP(recipient) };
  }
}