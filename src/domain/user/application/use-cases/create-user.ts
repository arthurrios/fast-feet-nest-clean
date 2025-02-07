import { Either, left, right } from '@/core/either'
import { User } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { HashGenerator } from '@/domain/user/application/cryptography/hash-generator'
import { Role } from '../../@types/role'
import { CPF } from '../../enterprise/entities/value-objects/cpf'
import { Injectable } from '@nestjs/common'

interface CreateUserUseCaseRequest {
  name: string
  email: string
  cpf: string
  password: string
  role: Role
}

type CreateUserUseCaseResponse = Either<UserAlreadyExistsError, { user: User }>

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    cpf,
    password,
    role,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userWithSameCPF = await this.usersRepository.findByCpf(cpf)

    if (userWithSameCPF) {
      return left(new UserAlreadyExistsError(cpf.toString()))
    }

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email))
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const user = User.create({
      cpf: CPF.create(cpf),
      email,
      name,
      password: hashedPassword,
      role,
    })

    await this.usersRepository.create(user)

    return right({ user })
  }
}
