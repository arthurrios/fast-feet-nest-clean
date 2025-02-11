import { Coordinate } from 'test/utils/get-distance-between-coordinates'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { OrdersRepository } from '../repository/orders-repository'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'
import { OrderAttachmentsRepository } from '../repository/order-attachments-repository'
import { OrderAttachmentList } from '../../enterprise/entities/order-attachment-list'
import { OrderAttachment } from '../../enterprise/entities/order-attachment'
import { Injectable } from '@nestjs/common'

interface EditOrderUseCaseRequest {
  requesterId: string
  orderId: string
  recipientId: string
  title: string
  description: string
  coordinate: Coordinate
  attachmentsIds: string[]
}

type EditOrderUseCaseResponse = Either<
  UnauthorizedAdminOnlyError | ResourceNotFoundError,
  null
>

@Injectable()
export class EditOrderUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private ordersRepository: OrdersRepository,
    private orderAttachmentsRepository: OrderAttachmentsRepository,
  ) {}

  async execute({
    requesterId,
    recipientId,
    orderId,
    title,
    description,
    coordinate,
    attachmentsIds,
  }: EditOrderUseCaseRequest): Promise<EditOrderUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError('order'))
    }

    const currentOrderAttachments =
      await this.orderAttachmentsRepository.findManyByOrderId(orderId)

    const orderAttachmentList = new OrderAttachmentList(currentOrderAttachments)

    const orderAttachments = attachmentsIds.map((attachmentId) => {
      return OrderAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        orderId: order.id,
      })
    })

    orderAttachmentList.update(orderAttachments)

    order.attachments = orderAttachmentList
    order.title = title
    order.description = description
    order.coordinate = coordinate
    order.recipientId = recipientId

    await this.ordersRepository.save(order)

    return right(null)
  }
}
