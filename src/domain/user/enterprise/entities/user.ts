import { Role } from '../../@types/role'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { CPF } from './value-objects/cpf'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UserPasswordChangedEvent } from '../events/user-password-changed-event'

export interface UserProps {
  name: string
  cpf: CPF
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt?: Date | null
}

export class User<
  Props extends UserProps = UserProps,
> extends AggregateRoot<Props> {
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

  get role() {
    return this.props.role
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return user
  }

  changePassword(newPassword: string) {
    this.props.password = newPassword
    this.touch()
    this.addDomainEvent(new UserPasswordChangedEvent(this))
  }
}
