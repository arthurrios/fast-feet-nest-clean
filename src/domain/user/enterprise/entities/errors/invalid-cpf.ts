import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidCpfError extends Error implements UseCaseError {
  constructor(cpf: string) {
    super(`The CPF "${cpf}" is not valid.`)
  }
}
