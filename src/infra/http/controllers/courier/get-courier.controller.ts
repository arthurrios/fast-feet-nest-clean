import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { CourierPresenter } from '../../presenters/courier-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { GetCourierUseCase } from '@/domain/delivery/application/use-cases/get-courier'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { z } from 'zod'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'

const courierResponseSchema = z.object({
  id: z.string().describe('The unique identifier of the courier'),
  name: z.string().describe("The courier's full name"),
  cpf: z
    .string()
    .describe("The courier's CPF in formatted form (e.g., 123.456.789-01)"),
  email: z.string().email().describe("The courier's email address"),
  createdAt: z
    .string()
    .describe('The creation timestamp of the courier record'),
  updatedAt: z
    .string()
    .describe('The last update timestamp of the courier record'),
})

@ApiTags('Couriers')
@Controller('/couriers/:id')
export class GetCourierController {
  constructor(private getCourier: GetCourierUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch a specific courier by ID',
    description:
      'Retrieves a specific courier by their unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the courier to fetch.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Courier retrieved successfully.',
    schema: zodToOpenApiSchema(
      z.object({
        courier: courierResponseSchema,
      }),
      {
        courier: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          cpf: '123.456.789-01',
          email: 'john.doe@example.com',
          createdAt: '2023-10-01T12:00:00Z',
          updatedAt: '2023-10-01T12:00:00Z',
        },
      },
    ),
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
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getCourier.execute({
      requesterId: user.sub,
      courierId: id,
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

    const { courier } = result.value
    return { courier: CourierPresenter.toHTTP(courier) }
  }
}
