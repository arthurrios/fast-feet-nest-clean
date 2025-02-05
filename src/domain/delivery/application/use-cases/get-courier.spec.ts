import { AuthorizationService } from '@/core/services/authorization-service'
import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeCourier } from 'test/factories/make-courier'
import { GetCourierUseCase } from './get-courier'

let authorizationService: AuthorizationService
let inMemoryCouriersRepository: InMemoryCouriersRepository
let sut: GetCourierUseCase
describe('Get Courier', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryCouriersRepository = new InMemoryCouriersRepository()

    sut = new GetCourierUseCase(
      authorizationService,
      inMemoryCouriersRepository,
    )
  })
  it('should be able to get courier succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const courier = makeCourier({ name: 'John Doe' })
    inMemoryCouriersRepository.items.push(courier)

    const result = await sut.execute({
      requesterId: adminId.toValue(),
      courierId: courier.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      courier: expect.objectContaining({ name: 'John Doe' }),
    })
  })
  it('should not be able to get courier if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const courier = makeCourier()

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      courierId: courier.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
  })
})
