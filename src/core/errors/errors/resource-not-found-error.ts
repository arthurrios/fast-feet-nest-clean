import { UseCaseError } from '../use-case-error'

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(identifier: string) {
    const capitalizedIdentifier =
      identifier.charAt(0).toUpperCase() + identifier.slice(1)

    super(`${capitalizedIdentifier} not found`)
  }
}
