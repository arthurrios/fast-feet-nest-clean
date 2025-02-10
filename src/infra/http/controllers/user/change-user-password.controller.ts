import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { ChangeUserPasswordUseCase } from '@/domain/user/application/use-cases/change-user-password'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

const changeUserPasswordBodySchema = z.object({
  newPassword: z.string().min(6),
})

const bodyValidationPipe = new ZodValidationPipe(changeUserPasswordBodySchema)

type ChangeUserPasswordBodySchema = z.infer<typeof changeUserPasswordBodySchema>

@Controller('/users/:id/password')
export class ChangeUserPasswordController {
  constructor(private changeUserPassword: ChangeUserPasswordUseCase) {}

  @Post()
  @HttpCode(204)
  async handle(
    @Param('id') userId: string,
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: ChangeUserPasswordBodySchema,
  ) {
    const { newPassword } = body

    const result = await this.changeUserPassword.execute({
      requesterId: user.sub,
      newPassword,
      userId,
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
