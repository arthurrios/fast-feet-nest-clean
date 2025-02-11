import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import {
  PageQuerySchema,
  pageQueryValidationPipe,
} from '../order/get-orders.controller'
import { FetchUserDeliveriesUseCase } from '@/domain/user/application/use-cases/fetch-user-deliveries'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UserDeliveryPresenter } from '../../presenters/user-delivery-presenter'

@Controller('/users/:id/deliveries')
export class FetchUserDeliveriesController {
  constructor(private fetchUserDeliveries: FetchUserDeliveriesUseCase) {}

  @Get()
  async handle(
    @Param('id') userId: string,
    @Query('page', pageQueryValidationPipe) page: PageQuerySchema,
  ) {
    const result = await this.fetchUserDeliveries.execute({
      userId,
      page,
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

    const deliveries = result.value.deliveries

    return { deliveries: deliveries.map(UserDeliveryPresenter.toHTTP) }
  }
}
