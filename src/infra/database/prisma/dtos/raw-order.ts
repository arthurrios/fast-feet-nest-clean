import { OrderStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface RawOrder {
  id: string
  title: string
  description: string
  slug: string
  status: OrderStatus
  latitude: Decimal
  longitude: Decimal
  createdAt: Date
  updatedAt: Date | null
  courierId: string | null
  recipientId: string
}
