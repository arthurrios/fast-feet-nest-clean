import { ApiResponseOptions } from '@nestjs/swagger';

export const notFoundResponse = (
  message?: string
): ApiResponseOptions => ({
  status: 404,
  description: 'Not found error.',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 404 },
      message: { type: 'string', example: message ?? 'Resource not found' },
    },
  },
});