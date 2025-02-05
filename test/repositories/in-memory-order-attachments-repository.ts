import { OrderAttachmentsRepository } from '@/domain/delivery/application/repository/order-attachments-repository'
import { OrderAttachment } from '@/domain/delivery/enterprise/entities/order-attachment'

export class InMemoryOrderAttachmentsRepository
  implements OrderAttachmentsRepository
{
  public items: OrderAttachment[] = []

  async findManyByOrderId(orderId: string) {
    const orderAttachments = this.items.filter(
      (item) => item.orderId.toString() === orderId,
    )

    return orderAttachments
  }

  async createMany(attachments: OrderAttachment[]): Promise<void> {
    this.items.push(...attachments)
  }

  async deleteMany(attachments: OrderAttachment[]): Promise<void> {
    const orderAttachments = this.items.filter((item) => {
      return !attachments.some((attachment) => attachment.equals(item))
    })

    this.items = orderAttachments
  }

  async deleteManyByOrderId(orderId: string): Promise<void> {
    const orderAttachments = this.items.filter(
      (item) => item.orderId.toString() !== orderId,
    )

    this.items = orderAttachments
  }
}
