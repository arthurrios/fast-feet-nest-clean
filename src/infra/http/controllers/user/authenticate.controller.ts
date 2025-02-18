import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { AuthenticateUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { WrongCredentialsError } from '@/domain/user/application/use-cases/errors/wrong-credentials-error'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { successResponse } from '@/swagger/responses/sucess.response'
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'

const authenticateBodySchema = z.object({
  cpf: z.string().length(11),
  password: z.string().min(6),
})

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema)

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@ApiTags('Users')
@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticate: AuthenticateUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Authenticate a user',
    description: 'Logs in a user by validating their CPF and password.',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(authenticateBodySchema),
  })
  @ApiResponse(
    successResponse('User authenticated successfully.', {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
  )
  @ApiResponse(unauthorizedResponse())
  @ApiResponse(badRequestResponse)
  async handle(@Body(bodyValidationPipe) body: AuthenticateBodySchema) {
    const { cpf, password } = body

    const result = await this.authenticate.execute({
      cpf,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const accessToken = result.value.accessToken

    return { access_token: accessToken }
  }
}
