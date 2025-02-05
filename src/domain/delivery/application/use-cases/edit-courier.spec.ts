import { AuthorizationService } from '@/core/services/authorization-service'
import { makeCourier } from 'test/factories/make-courier'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'
import { EditCourierUseCase } from './edit-courier'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let authorizationService: AuthorizationService
let inMemoryCouriersRepository: InMemoryCouriersRepository
let sut: EditCourierUseCase

describe('Edit Courier', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryCouriersRepository = new InMemoryCouriersRepository()

    sut = new EditCourierUseCase(
      authorizationService,
      inMemoryCouriersRepository,
    )
  })
  it('should be able to edit a courier succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const courier = makeCourier({ name: 'John Doe' })

    await inMemoryCouriersRepository.create(courier)

    await sut.execute({
      courierId: courier.id.toValue(),
      requesterId: adminId.toValue(),
      name: 'Jane Doe',
      cpf: courier.cpf.getRaw(),
      email: courier.email,
    })

    expect(inMemoryCouriersRepository.items[0].name).toBe('Jane Doe')
    expect(inMemoryCouriersRepository.items[0].cpf).toBe(courier.cpf)
  })
  it('should not be able to edit courier if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const courier = makeCourier()

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      courierId: courier.id.toValue(),
      name: 'Jane Doe',
      cpf: courier.cpf.getRaw(),
      email: courier.email,
    })

    expect(result.isLeft()).toBe(true)
  })
})
