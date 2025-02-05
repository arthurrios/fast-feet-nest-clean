import { AuthorizationService } from '@/core/services/authorization-service'
import { makeCourier } from 'test/factories/make-courier'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'
import { EditCourierUseCase } from './edit-courier'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteCourierUseCase } from './delete-courier'

let authorizationService: AuthorizationService
let inMemoryCouriersRepository: InMemoryCouriersRepository
let sut: DeleteCourierUseCase

describe('Delete Courier', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryCouriersRepository = new InMemoryCouriersRepository()

    sut = new DeleteCourierUseCase(
      authorizationService,
      inMemoryCouriersRepository,
    )
  })
  it('should be able to delete a courier succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const courier = makeCourier({ name: 'John Doe' })

    await inMemoryCouriersRepository.create(courier)

    await sut.execute({
      courierId: courier.id.toValue(),
      requesterId: adminId.toValue(),
    })

    expect(inMemoryCouriersRepository.items).toHaveLength(0)
  })
  it('should not be able to edit courier if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const courier = makeCourier()

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      courierId: courier.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
  })
})
