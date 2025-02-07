import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcrypt'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { Role } from '@/domain/user/@types/role'
import { UserAlreadyExistsError } from '@/domain/user/application/use-cases/errors/user-already-exists-error'

const registerUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional(),
})

type RegisterUserBodySchema = z.infer<typeof registerUserBodySchema>

@Controller('/users')
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerUserBodySchema))
  async handle(@Body() body: RegisterUserBodySchema) {
    const { email, name, cpf, password, role } = body

    const result = await this.createUser.execute({
      name,
      email,
      cpf,
      password,
      role: role ?? Role.COURIER,
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
