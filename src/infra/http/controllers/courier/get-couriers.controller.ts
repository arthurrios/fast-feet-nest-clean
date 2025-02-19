import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PageQuerySchema,
  pageQueryValidationPipe,
} from '../order/get-orders.controller';
import { GetCouriersUseCase } from '@/domain/delivery/application/use-cases/get-couriers';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { CourierPresenter } from '../../presenters/courier-presenter';
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { z } from 'zod';
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema';
import { badRequestResponse } from '@/swagger/responses/bad-request.response';
import { unauthorizedResponse } from '@/swagger/responses/unauthorized.response';

// Define a Zod schema for the courier response
const courierResponseSchema = z.object({
  id: z.string().describe('The unique identifier of the courier'),
  name: z.string().describe("The courier's full name"),
  cpf: z.string().describe("The courier's CPF in formatted form (e.g., 123.456.789-01)"),
  email: z.string().email().describe("The courier's email address"),
  createdAt: z.string().describe('The creation timestamp of the courier record'),
  updatedAt: z.string().describe('The last update timestamp of the courier record'),
});

@ApiTags('Couriers')
@Controller('/couriers')
export class GetCouriersController {
  constructor(private getCouriers: GetCouriersUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch a paginated list of couriers',
    description:
      'Retrieves a paginated list of couriers. Only accessible by authorized admin users.',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'The page number for pagination (default: 1).',
    example: 1,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Couriers retrieved successfully.',
    schema: zodToOpenApiSchema(
      z.object({
        couriers: z.array(courierResponseSchema),
      }),
      {
        couriers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            cpf: '123.456.789-01',
            email: 'john.doe@example.com',
            createdAt: '2023-10-01T12:00:00Z',
            updatedAt: '2023-10-01T12:00:00Z',
          },
        ],
      }
    ),
  })
  @ApiResponse(
    unauthorizedResponse('Unauthorized: Only admins can perform this action.'),
  )
  @ApiResponse(badRequestResponse())
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page', pageQueryValidationPipe) page: PageQuerySchema,
  ) {
    const result = await this.getCouriers.execute({
      requesterId: user.sub,
      params: { page },
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case UnauthorizedAdminOnlyError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const couriers = result.value.couriers;
    return { couriers: couriers.map(CourierPresenter.toHTTP) };
  }
}