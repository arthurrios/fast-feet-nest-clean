import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PageQuerySchema,
  pageQueryValidationPipe,
} from '../order/get-orders.controller';
import { FetchUserDeliveriesUseCase } from '@/domain/user/application/use-cases/fetch-user-deliveries';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { UserDeliveryPresenter } from '../../presenters/user-delivery-presenter';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { badRequestResponse } from '@/swagger/responses/bad-request.response';
import { notFoundResponse } from '@/swagger/responses/not-found.response';
import { successResponse } from '@/swagger/responses/sucess.response';
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error';
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response';

@ApiTags('Users')
@Controller('/users/:id/deliveries')
export class FetchUserDeliveriesController {
  constructor(private fetchUserDeliveries: FetchUserDeliveriesUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch user deliveries',
    description:
      'Retrieves a paginated list of deliveries for a specific user. Only accessible by authorized users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the user whose deliveries will be fetched.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'The page number for pagination (default: 1).',
    example: 1,
    required: false,
  })
  @ApiResponse(
    successResponse('Deliveries retrieved successfully.', {
      deliveries: [
        {
          cpf: '12345678901',
          deliveryId: '987e6543-e21b-12d3-a456-426614174001',
          role: 'COURIER',
        },
        {
          cpf: '98765432109',
          deliveryId: '123e4567-e89b-12d3-a456-426614174002',
          role: 'CUSTOMER',
        },
      ],
    }),
  )
  @ApiResponse(unauthorizedResponse('Unauthorized: Only admins can perform this action.'))
  @ApiResponse(notFoundResponse('User with ID "123e4567-e89b-12d3-a456-426614174000" not found.'))
  @ApiResponse(badRequestResponse)
  async handle(
    @Param('id') userId: string,
    @Query('page', pageQueryValidationPipe) page: PageQuerySchema,
  ) {
    const result = await this.fetchUserDeliveries.execute({
      userId,
      page,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const deliveries = result.value.deliveries;
    return { deliveries: deliveries.map(UserDeliveryPresenter.toHTTP) };
  }
}