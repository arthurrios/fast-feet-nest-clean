import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { RecipientPresenter } from '../../presenters/recipient-presenter'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { GetRecipientUseCase } from '@/domain/delivery/application/use-cases/get-recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

@Controller('/recipients/:id')
export class GetRecipientController {
  constructor(private getRecipient: GetRecipientUseCase) {}

  @Get()
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.getRecipient.execute({
      requesterId: user.sub,
      recipientId: id,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { recipient } = result.value

    return { recipient: RecipientPresenter.toHTTP(recipient) }
  }
}
