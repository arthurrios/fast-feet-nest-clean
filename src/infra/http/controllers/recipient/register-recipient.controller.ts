import { RegisterRecipientUseCase } from '@/domain/delivery/application/use-cases/register-recipient'
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
import { RecipientAlreadyExistsError } from '@/domain/delivery/application/use-cases/errors/recipient-already-exists-error'

const registerRecipientBodySchema = z.object({
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

const bodyValidationPipe = new ZodValidationPipe(registerRecipientBodySchema)

type registerRecipientBodySchema = z.infer<typeof registerRecipientBodySchema>

@Controller('/recipients')
export class RegisterRecipientController {
  constructor(private registerRecipient: RegisterRecipientUseCase) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: registerRecipientBodySchema,
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
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
