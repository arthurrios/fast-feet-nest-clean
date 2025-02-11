import { PaginationParams } from '@/core/repositories/pagination-params'
import {
  UserDeliveriesRepository,
  UserDelivery,
} from '@/domain/user/application/repositories/user-deliveries-repository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Role } from '@/domain/user/@types/role'

@Injectable()
export class PrismaUserDeliveriesRepository
  implements UserDeliveriesRepository
{
  constructor(private prisma: PrismaService) {}
  /**
   * Associates a delivery with a user based on CPF and role.
   * If role is COURIER, updates the courierId of the order.
   * If role is RECIPIENT, updates the recipientId of the order.
   */
  async createOrUpdate(delivery: UserDelivery): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        cpf: delivery.cpf,
      },
    })

    if (!user) {
      throw new Error(`User with CPF ${delivery.cpf} not found`)
    }

    if (delivery.role === Role.COURIER) {
      await this.prisma.order.update({
        where: { id: delivery.deliveryId },
        data: {
          courierId: user.id,
        },
      })
    } else if (delivery.role === Role.RECIPIENT) {
      await this.prisma.order.update({
        where: { id: delivery.deliveryId },
        data: {
          recipientId: user.id,
        },
      })
    } else {
      throw new Error(`Unknown role: ${delivery.role}`)
    }
  }

  /**
   * Finds orders related to a user by matching the CPF either on the recipient or courier relation.
   */
  async findByCpf(
    cpf: string,
    { page }: PaginationParams,
  ): Promise<UserDelivery[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [{ recipient: { cpf } }, { courier: { cpf } }],
      },
      skip: (page - 1) * 20,
      take: 20,
      include: {
        recipient: true,
        courier: true,
      },
    })

    return orders.flatMap((order) => {
      const deliveries: UserDelivery[] = []

      if (order.recipient?.cpf === cpf) {
        deliveries.push({
          cpf: order.recipient.cpf,
          deliveryId: order.id,
          role: Role.RECIPIENT,
        })
      }

      if (order.courier?.cpf === cpf) {
        deliveries.push({
          cpf: order.courier.cpf,
          deliveryId: order.id,
          role: Role.COURIER,
        })
      }

      return deliveries
    })
  }
}
