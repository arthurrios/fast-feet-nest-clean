import { makeCourier } from 'test/factories/make-courier'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { waitFor } from 'test/utils/wait-for'
import { OnCourierCreated } from './on-courier-registered'
import { CreateUserUseCase } from '../use-cases/create-user'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { MockInstance } from 'vitest'
import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'

let inMemoryCouriersRepository: InMemoryCouriersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let createUserUseCase: CreateUserUseCase

let createUserExecuteSpy: MockInstance

describe('On Courier Registered', () => {
  beforeEach(() => {
    inMemoryCouriersRepository = new InMemoryCouriersRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
    )

    createUserExecuteSpy = vi.spyOn(createUserUseCase, 'execute')

    new OnCourierCreated(createUserUseCase)
  })

  it('should create user with courier role when courier is created', async () => {
    const courier = makeCourier()

    inMemoryCouriersRepository.create(courier)

    await waitFor(() => {
      expect(createUserExecuteSpy).toHaveBeenCalled()
    })
  })
})
