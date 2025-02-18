import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

export function zodToOpenApiSchema(schema: z.ZodType<any>) {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
  })

  const { $schema, definitions, ...swaggerSchema } = jsonSchema

  return swaggerSchema as SchemaObject
}
