import { Either, left, right } from '@/core/either'
import { HashComparer } from '../cryptography/hash-comparer'
import { UsersRepository } from '../repositories/users-repository'
import { CPF } from '../../enterprise/entities/value-objects/cpf'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { Role } from '../../@types/role'
import { Injectable } from '@nestjs/common'

interface AuthenticateUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  { access_token: string }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    cpf,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByCpf(cpf)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    })

    return right({ access_token: accessToken })
  }
}
