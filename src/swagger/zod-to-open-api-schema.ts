import { z } from 'zod'
import { zodToJsonSchema, JsonSchema7ObjectType } from 'zod-to-json-schema'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export function zodToOpenApiSchema(
  schema: z.ZodType<any>,
  examples?: Record<string, any>,
): SchemaObject {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
  }) as JsonSchema7ObjectType

  if (examples) {
    Object.keys(examples).forEach((key) => {
      if (jsonSchema.properties && jsonSchema.properties[key]) {
        ;(jsonSchema.properties[key] as { example?: any }).example =
          examples[key]
      }
    })
  }

  return jsonSchema as SchemaObject
}
