import { DeleteCourierUseCase } from '@/domain/delivery/application/use-cases/delete-courier'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

@Controller('/couriers/:id')
export class DeleteCourierController {
  constructor(private deleteCourier: DeleteCourierUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') courierId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deleteCourier.execute({
      requesterId: user.sub,
      courierId,
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
