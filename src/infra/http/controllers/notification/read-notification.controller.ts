import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'

@ApiTags('Notifications')
@Controller('/notifications/:notificationId/read')
export class ReadNotificationController {
  constructor(private readNotification: ReadNotificationUseCase) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Mark a notification as read',
    description:
      'Marks a specific notification as read by its unique ID. Only accessible by the recipient of the notification.',
  })
  @ApiParam({
    name: 'notificationId',
    type: 'string',
    description: 'The unique identifier of the notification to mark as read.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification marked as read successfully.',
  })
  @ApiResponse(badRequestResponse('Invalid input data or unauthorized action.'))
  async handle(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.readNotification.execute({
      notificationId,
      recipientId: user.sub,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
