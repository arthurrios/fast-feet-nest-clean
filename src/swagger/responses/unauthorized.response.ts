import { ApiResponseOptions } from '@nestjs/swagger'

export const unauthorizedResponse = (message?: string): ApiResponseOptions => ({
  status: 401,
  description: 'Invalid credentials.',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 401 },
      message: { type: 'string', example: message ?? 'Invalid credentials' },
    },
  },
})
