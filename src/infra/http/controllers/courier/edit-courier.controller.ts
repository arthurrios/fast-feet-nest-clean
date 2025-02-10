import { EditCourierUseCase } from '@/domain/delivery/application/use-cases/edit-courier'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

const editCourierBodySchema = z.object({
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
})

const bodyValidationPipe = new ZodValidationPipe(editCourierBodySchema)

type editCourierBodySchema = z.infer<typeof editCourierBodySchema>

@Controller('/couriers/:id')
export class EditCourierController {
  constructor(private editCourier: EditCourierUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Param('id') courierId: string,
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: editCourierBodySchema,
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
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
