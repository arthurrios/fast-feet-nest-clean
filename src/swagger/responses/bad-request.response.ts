import { ApiResponseOptions } from '@nestjs/swagger'

export const badRequestResponse: ApiResponseOptions = {
  status: 400,
  description: 'Bad request or validation error.',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 400 },
      message: { type: 'string', example: 'Validation failed' },
    },
  },
}
