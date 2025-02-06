import { User } from '../../enterprise/entities/user'
import { CPF } from '../../enterprise/entities/value-objects/cpf'

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>
  abstract findByCPF(cpf: CPF): Promise<User | null>
  abstract create(user: User): Promise<void>
  abstract save(user: User): Promise<void>
}
