import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
  })
  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  console.log(`🚀 Server ready at http://localhost:${port}/graphql`)
  await app.listen(port, '0.0.0.0')
}
bootstrap()
