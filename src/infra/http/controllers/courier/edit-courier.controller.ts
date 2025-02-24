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
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { EditCourierUseCase } from '@/domain/delivery/application/use-cases/edit-courier'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
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
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'

const editCourierBodySchema = z.object({
  name: z.string().describe("The courier's full name"),
  email: z.string().email().describe("The courier's email address"),
  cpf: z
    .string()
    .refine(
      (cpf) => {
        try {
          CPF.create(cpf)
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Invalid CPF',
      },
    )
    .describe("The courier's CPF (11 digits)"),
})

const bodyValidationPipe = new ZodValidationPipe(editCourierBodySchema)
type EditCourierBodySchema = z.infer<typeof editCourierBodySchema>

@ApiTags('Couriers')
@Controller('/couriers/:id')
export class EditCourierController {
  constructor(private editCourier: EditCourierUseCase) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Edit a specific courier by ID',
    description:
      'Updates the details of a specific courier by their unique ID. Only accessible by authorized admin users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the courier to edit.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(editCourierBodySchema, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      cpf: '12345678901',
    }),
  })
  @ApiResponse({
    status: 204,
    description: 'Courier updated successfully.',
  })
  @ApiResponse(
    notFoundResponse(
      'Courier with ID "123e4567-e89b-12d3-a456-426614174000" not found.',
    ),
  )
  @ApiResponse(
    unauthorizedResponse(
      'Only authorized admin users can perform this action.',
    ),
  )
  @ApiResponse(
    badRequestResponse('Invalid input data. Please check the request body.'),
  )
  async handle(
    @Param('id') courierId: string,
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: EditCourierBodySchema,
  ) {
    const { name, email, cpf } = body

    const result = await this.editCourier.execute({
      requesterId: user.sub,
      courierId,
      name,
      email,
      cpf,
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
