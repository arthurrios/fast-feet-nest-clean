import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order, OrderProps } from '@/domain/delivery/enterprise/entities/order'
import { Slug } from '@/domain/delivery/enterprise/entities/value-objects/slug'
import { OrderAttachmentList } from '@/domain/delivery/enterprise/entities/order-attachment-list'

export function makeOrder(override: Partial<OrderProps>, id?: UniqueEntityID) {
  const title = faker.lorem.sentence()

  const order = Order.create(
    {
      recipientId: new UniqueEntityID(),
      title,
      description: faker.lorem.paragraph(),
      slug: Slug.create(title),
      coordinate: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
      },
      createdAt: new Date(),
      attachments: new OrderAttachmentList(),

      ...override,
    },
    id,
  )

  return order
}
