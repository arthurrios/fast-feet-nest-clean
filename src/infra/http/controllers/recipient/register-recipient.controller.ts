import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { RegisterRecipientUseCase } from '@/domain/delivery/application/use-cases/register-recipient'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { RecipientAlreadyExistsError } from '@/domain/delivery/application/use-cases/errors/recipient-already-exists-error'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { conflictResponse } from '@/swagger/responses/conflict.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

const registerRecipientBodySchema = z.object({
  name: z.string().describe("The recipient's full name"),
  email: z.string().email().describe("The recipient's email address"),
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
    .describe("The recipient's CPF (11 digits)"),
  password: z
    .string()
    .min(6)
    .describe("The recipient's password (minimum 6 characters)"),
})

const bodyValidationPipe = new ZodValidationPipe(registerRecipientBodySchema)
type RegisterRecipientBodySchema = z.infer<typeof registerRecipientBodySchema>

@ApiTags('Recipients')
@Controller('/recipients')
export class RegisterRecipientController {
  constructor(private registerRecipient: RegisterRecipientUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new recipient',
    description:
      'Registers a new recipient with their name, email, CPF, and password. Only accessible by authorized users.',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(registerRecipientBodySchema, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      cpf: '12345678901',
      password: 'password123',
    }),
  })
  @ApiResponse({
    status: 201,
    description: 'Recipient registered successfully.',
  })
  @ApiResponse(
    conflictResponse('Recipient with CPF "12345678901" already exists.'),
  )
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: RegisterRecipientBodySchema,
  ) {
    const { name, email, cpf, password } = body

    const result = await this.registerRecipient.execute({
      requesterId: user.sub,
      data: {
        name,
        email,
        cpf,
        password,
      },
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case RecipientAlreadyExistsError:
          throw new ConflictException(error.message)
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
