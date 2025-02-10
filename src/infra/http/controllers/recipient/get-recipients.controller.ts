import { GetRecipientsUseCase } from '@/domain/delivery/application/use-cases/get-recipients'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import {
  PageQuerySchema,
  pageQueryValidationPipe,
} from '../order/get-orders.controller'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { RecipientPresenter } from '../../presenters/recipient-presenter'

@Controller('/recipients')
export class GetRecipientsController {
  constructor(private getRecipients: GetRecipientsUseCase) {}

  @Get()
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page', pageQueryValidationPipe) page: PageQuerySchema,
  ) {
    const result = await this.getRecipients.execute({
      requesterId: user.sub,
      params: { page },
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const recipients = result.value.recipients

    return { recipients: recipients.map(RecipientPresenter.toHTTP) }
  }
}
