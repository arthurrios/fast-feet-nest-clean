import { ApiResponseOptions } from '@nestjs/swagger';

export const conflictResponse = (
  message?: string
): ApiResponseOptions => ({
  status: 409,
  description: 'Conflict error.',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 409 },
      message: { type: 'string', example: message ?? 'User already exists' },
    },
  },
});