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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger'
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'
import { notFoundResponse } from '@/swagger/responses/not-found.response'

const changeUserPasswordBodySchema = z.object({
  newPassword: z
    .string()
    .min(6)
    .describe("The user's new password (minimum 6 characters)"),
})

const bodyValidationPipe = new ZodValidationPipe(changeUserPasswordBodySchema)
type ChangeUserPasswordBodySchema = z.infer<typeof changeUserPasswordBodySchema>

@ApiTags('Users')
@Controller('/users/:id/password')
export class ChangeUserPasswordController {
  constructor(private changeUserPassword: ChangeUserPasswordUseCase) {}

  @Post()
  @HttpCode(204)
  @ApiOperation({
    summary: "Change a user's password",
    description:
      'Updates the password of a specific user. Only accessible by authorized users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the user whose password will be changed.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(changeUserPasswordBodySchema, {
      newPassword: 'newSecurePassword123',
    }),
  })
  @ApiResponse(notFoundResponse('User not found.'))
  @ApiResponse(badRequestResponse())
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
