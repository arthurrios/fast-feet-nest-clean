import { Either, left, right } from '@/core/either'
import {
  UserDeliveriesRepository,
  UserDelivery,
} from '../repositories/user-deliveries-repository'
import { UsersRepository } from '../repositories/users-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

interface FetchUserDeliveriesRequest {
  page: number
  userId: string
}

type FetchUserDeliveriesResponse = Either<
  ResourceNotFoundError,
  { deliveries: UserDelivery[] }
>

export class FetchUserDeliveriesUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private userDeliveriesRepository: UserDeliveriesRepository,
  ) {}

  async execute({
    userId,
    page,
  }: FetchUserDeliveriesRequest): Promise<FetchUserDeliveriesResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('user'))
    }

    const deliveries = await this.userDeliveriesRepository.findByCpf(user.cpf, {
      page,
    })

    return right({ deliveries })
  }
}
