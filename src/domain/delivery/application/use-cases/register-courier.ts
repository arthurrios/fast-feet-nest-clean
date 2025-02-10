import { Either, left, right } from '@/core/either'
import { Courier } from '../../enterprise/entities/courier'
import { CourierAlreadyExistsError } from './errors/courier-already-exists-error'
import { HashGenerator } from '@/domain/user/application/cryptography/hash-generator'
import { CouriersRepository } from '../repository/courier-repository'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'
import { Injectable } from '@nestjs/common'

interface RegisterCourierUseCaseRequest {
  requesterId: string
  data: {
    name: string
    email: string
    cpf: string
    password: string
  }
}

type RegisterCourierUseCaseResponse = Either<
  CourierAlreadyExistsError | UnauthorizedAdminOnlyError,
  { courier: Courier }
>

@Injectable()
export class RegisterCourierUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private couriersRepository: CouriersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    requesterId,
    data,
  }: RegisterCourierUseCaseRequest): Promise<RegisterCourierUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const courierWithSameCPF = await this.couriersRepository.findByCpf(data.cpf)

    if (courierWithSameCPF) {
      return left(new CourierAlreadyExistsError(data.cpf.toString()))
    }

    const hashedPassword = await this.hashGenerator.hash(data.password)

    const courier = Courier.create({
      ...data,
      cpf: CPF.create(data.cpf),
      password: hashedPassword,
      createdAt: new Date(),
    })

    await this.couriersRepository.create(courier)

    return right({ courier })
  }
}
