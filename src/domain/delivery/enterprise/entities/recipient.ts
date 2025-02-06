import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { UserLinkedEntity } from '../../../../core/shared/entities/user-linked-entity'
import { User } from '@/domain/user/enterprise/entities/user'
import { Role } from '@/domain/user/@types/role'

export interface RecipientProps {
  name: string
  cpf: CPF
  email: string
  password: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Recipient
  extends Entity<RecipientProps>
  implements UserLinkedEntity
{
  get name() {
    return this.props.name
  }

  get cpf() {
    return this.props.cpf
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set cpf(cpf: CPF) {
    this.props.cpf = cpf
    this.touch()
  }

  set email(email: string) {
    this.props.email = email
    this.touch()
  }

  static create(props: RecipientProps, id?: UniqueEntityID): Recipient {
    const recipient = new Recipient(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return recipient
  }

  static fromUser(user: User): Recipient {
    if (user.role !== Role.RECIPIENT) {
      throw new Error('User is not a recipient')
    }

    return new Recipient(
      {
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      user.id,
    )
  }
}
