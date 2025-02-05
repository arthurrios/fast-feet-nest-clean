import { Notification } from '../../enterprise/entities/notification'
import { left, right, type Either } from '@/core/either'
import { NotificationsRepository } from '../repositories/notifications-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

interface ReadNotificationUseCaseRequest {
  recipientId: string
  notificationId: string
}

type ReadNotificationUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { notification: Notification }
>

export class ReadNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    notificationId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const notification =
      await this.notificationsRepository.findById(notificationId)

    if (!notification) {
      return left(new ResourceNotFoundError('notification'))
    }

    if (recipientId !== notification.recipientId.toString()) {
      return left(
        new NotAllowedError('User is not allowed to read this notification.'),
      )
    }

    notification.read()

    await this.notificationsRepository.save(notification)

    return right({ notification })
  }
}
