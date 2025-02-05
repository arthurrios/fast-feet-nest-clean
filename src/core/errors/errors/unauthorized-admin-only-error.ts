import { UseCaseError } from '../use-case-error'

export class UnauthorizedAdminOnlyError extends Error implements UseCaseError {
  constructor() {
    super('Unauthorized: Only admins can perform this action.')
  }
}
