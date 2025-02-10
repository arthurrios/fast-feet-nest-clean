import { Courier } from '@/domain/delivery/enterprise/entities/courier'

export class CourierPresenter {
  static toHTTP(courier: Courier) {
    return {
      id: courier.id.toString(),
      name: courier.name,
      cpf: courier.cpf.getFormatted(),
      email: courier.email,
      createdAt: courier.createdAt,
      updatedAt: courier.updatedAt,
    }
  }
}
