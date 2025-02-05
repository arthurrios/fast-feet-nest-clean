import { UseCaseError } from '@/core/errors/use-case-error'

export class CourierAlreadyExistsError extends Error implements UseCaseError {
  constructor(cpf: string) {
    super(`Courier with CPF "${cpf}" already exists`)
  }
}
