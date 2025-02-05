import { Controller, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

// const registerUserBodySchema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   cpf: z.string().length(11),
//   password: z.string().min(6),
//   role: z.enum(['COURIER', 'ADMIN', 'RECIPIENT']),
// })

// type RegisterUserBodySchema = z.infer<typeof registerUserBodySchema>

@Controller('/orders')
@UseGuards(JwtAuthGuard)
export class CreateOrderController {
  constructor() {}

  @Post()
  // @HttpCode(201)
  // @UsePipes(new ZodValidationPipe(registerUserBodySchema))
  async handle() {
    return 'ok'
  }
}
