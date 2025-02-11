import { UserDelivery } from '@/domain/user/application/repositories/user-deliveries-repository'

export class UserDeliveryPresenter {
  static toHTTP(delivery: UserDelivery) {
    return {
      cpf: delivery.cpf,
      deliveryId: delivery.deliveryId,
      role: delivery.role,
    }
  }
}
