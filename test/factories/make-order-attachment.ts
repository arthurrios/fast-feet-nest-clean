import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  OrderAttachment,
  OrderAttachmentProps,
} from '@/domain/delivery/enterprise/entities/order-attachment'

export function makeOrderAttachment(
  override: Partial<OrderAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const orderAttachment = OrderAttachment.create(
    {
      orderId: new UniqueEntityID(),
      attachmentId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return orderAttachment
}
