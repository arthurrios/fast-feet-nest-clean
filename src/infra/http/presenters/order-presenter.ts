import { Order } from '@/domain/delivery/enterprise/entities/order'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      title: order.title,
      description: order.description,
      coordinate: {
        latitude: order.coordinate.latitude,
        longitude: order.coordinate.longitude,
      },
      slug: order.slug.value,
      recipientId: order.recipientId.toString(),
      courierId: order.courierId?.toString(),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}
