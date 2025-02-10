import { Recipient } from '@/domain/delivery/enterprise/entities/recipient'

export class RecipientPresenter {
  static toHTTP(recipient: Recipient) {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      cpf: recipient.cpf.getFormatted(),
      email: recipient.email,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }
  }
}
