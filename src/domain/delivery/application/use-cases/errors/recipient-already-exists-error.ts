import { UseCaseError } from '@/core/errors/use-case-error'

export class RecipientAlreadyExistsError extends Error implements UseCaseError {
  constructor(cpf: string) {
    super(`Recipient with CPF "${cpf}" already exists`)
  }
}
