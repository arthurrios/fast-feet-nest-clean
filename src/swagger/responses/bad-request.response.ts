import { ApiResponseOptions } from '@nestjs/swagger'

export const badRequestResponse = (message?: string): ApiResponseOptions => ({
  status: 400,
  description: 'Bad request or validation error.',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 400 },
      message: { type: 'string', example: message ?? 'Validation failed' },
    },
  },
})
