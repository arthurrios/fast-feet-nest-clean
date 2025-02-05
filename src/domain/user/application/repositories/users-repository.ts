import { User } from '../../enterprise/entities/user'
import { CPF } from '../../enterprise/entities/value-objects/cpf'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByCPF(cpf: CPF): Promise<User | null>
  create(user: User): Promise<void>
  save(user: User): Promise<void>
}
