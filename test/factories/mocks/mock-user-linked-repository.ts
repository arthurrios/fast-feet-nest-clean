import { UserLinkedEntityRepository } from '@/core/types/repositories/user-linked-entity-repository'
import { UserLinkedEntity } from '@/core/shared/entities/user-linked-entity'

export class MockUserLinkedRepository
  implements UserLinkedEntityRepository<UserLinkedEntity>
{
  public items: UserLinkedEntity[] = []
  public saveCalls: UserLinkedEntity[] = []

  async findByCpf(cpf: string): Promise<UserLinkedEntity | null> {
    return this.items.find((item) => item.cpf.toString() === cpf) || null
  }

  async save(entity: UserLinkedEntity): Promise<void> {
    this.saveCalls.push(entity)
    const index = this.items.findIndex((item) => item.cpf.equals(entity.cpf))
    if (index >= 0) {
      this.items[index] = entity
    }
  }
}
