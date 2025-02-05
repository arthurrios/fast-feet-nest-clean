import { UseCaseError } from '@/core/errors/use-case-error'

export class UserAlreadyExistsError extends Error implements UseCaseError {
  constructor(cpf: string) {
    super(`User with CPF "${cpf}" already exists`)
  }
}
