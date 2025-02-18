import { ApiResponseOptions } from '@nestjs/swagger'

export const successResponse = (
  description: string,
  exampleData: Record<string, any>,
): ApiResponseOptions => ({
  status: 201,
  description,
  schema: {
    type: 'object',
    properties: exampleData,
  },
})
