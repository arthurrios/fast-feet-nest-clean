import { RegisterCourierUseCase } from '@/domain/delivery/application/use-cases/register-courier'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { CourierAlreadyExistsError } from '@/domain/delivery/application/use-cases/errors/courier-already-exists-error'

const registerCourierBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().refine(
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
  ),
  password: z.string().min(6),
})

const bodyValidationPipe = new ZodValidationPipe(registerCourierBodySchema)

type registerCourierBodySchema = z.infer<typeof registerCourierBodySchema>

@Controller('/couriers')
export class RegisterCourierController {
  constructor(private registerCourier: RegisterCourierUseCase) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: registerCourierBodySchema,
  ) {
    const { name, email, cpf, password } = body

    const result = await this.registerCourier.execute({
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
        case CourierAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
