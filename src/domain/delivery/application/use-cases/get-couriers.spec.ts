import { AuthorizationService } from '@/core/services/authorization-service'
import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'
import { GetCouriersUseCase } from './get-couriers'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Courier } from '../../enterprise/entities/courier'
import { makeCourier } from 'test/factories/make-courier'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

let authorizationService: AuthorizationService
let inMemoryCouriersRepository: InMemoryCouriersRepository
let sut: GetCouriersUseCase
describe('Get Couriers', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryCouriersRepository = new InMemoryCouriersRepository()

    sut = new GetCouriersUseCase(
      authorizationService,
      inMemoryCouriersRepository,
    )
  })
  it('should be able to get couriers succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const couriers: Courier[] = Array.from({ length: 22 }).map((_, index) => {
      return makeCourier(
        {
          name: `Courier ${index}`,
          cpf: CPF.create(generateValidCpf()),
          email: `courier.${index}@email.com`,
        },
        new UniqueEntityID(index.toString()),
      )
    })

    inMemoryCouriersRepository.items.push(...couriers)

    const result = await sut.execute({
      requesterId: adminId.toValue(),
      params: { page: 1 },
    })

    expect(result.isRight() && result.value.couriers).toHaveLength(20)
  })
  it('should not be able to get couriers if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      params: { page: 1 },
    })

    expect(result.isLeft()).toBe(true)
  })
})
