import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { Role } from '@/domain/user/@types/role'
import { UserAlreadyExistsError } from '@/domain/user/application/use-cases/errors/user-already-exists-error'
import { Public } from '@/infra/auth/public'

const registerUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
  roles: z.array(z.nativeEnum(Role)),
})

const bodyValidationPipe = new ZodValidationPipe(registerUserBodySchema)

type RegisterUserBodySchema = z.infer<typeof registerUserBodySchema>

@Controller('/users')
@Public()
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: RegisterUserBodySchema) {
    const { email, name, cpf, password, roles } = body

    const result = await this.createUser.execute({
      name,
      email,
      cpf,
      password,
      roles: roles ?? [Role.COURIER],
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
