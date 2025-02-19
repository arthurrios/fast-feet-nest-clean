import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
  })
  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  const config = new DocumentBuilder()
    .setTitle('Fast Feet API')
    .setDescription(
      'An API for controlling orders from a fictitious carrier, FastFeet.',
    )
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  await app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  )

  await app.listen(port, '0.0.0.0')
}
bootstrap()
