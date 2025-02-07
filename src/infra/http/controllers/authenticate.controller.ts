import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { AuthenticateUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { WrongCredentialsError } from '@/domain/user/application/use-cases/errors/wrong-credentials-error'

const authenticateBodySchema = z.object({
  cpf: z.string().length(11),
  password: z.string().min(6),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(private authenticate: AuthenticateUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
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

    const accessToken = result.value.access_token

    return { access_token: accessToken }
  }
}
