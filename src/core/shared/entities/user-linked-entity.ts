import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

export interface UserLinkedEntity {
  cpf: CPF
  password: string
}
