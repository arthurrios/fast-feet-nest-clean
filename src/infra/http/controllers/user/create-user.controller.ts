import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user';
import { Role } from '@/domain/user/@types/role';
import { UserAlreadyExistsError } from '@/domain/user/application/use-cases/errors/user-already-exists-error';
import { Public } from '@/infra/auth/public';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { zodToOpenApiSchema } from '@/swagger/zod-to-open-api-schema';
import { badRequestResponse } from '@/swagger/responses/bad-request.response';
import { successResponse } from '@/swagger/responses/sucess.response';
import { conflictResponse } from '@/swagger/responses/conflict.response';

const registerUserBodySchema = z.object({
  name: z.string().describe('The user\'s full name'),
  email: z.string().email().describe('The user\'s email address'),
  cpf: z.string().length(11).describe('The user\'s CPF (11 digits)'),
  password: z.string().min(6).describe('The user\'s password (minimum 6 characters)'),
  roles: z.array(z.nativeEnum(Role)).describe('The user\'s roles'),
});

const bodyValidationPipe = new ZodValidationPipe(registerUserBodySchema);
type RegisterUserBodySchema = z.infer<typeof registerUserBodySchema>;

@ApiTags('Users')
@Controller('/users')
@Public()
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Registers a new user with their name, email, CPF, password, and roles.',
  })
  @ApiBody({
    schema: zodToOpenApiSchema(registerUserBodySchema, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      cpf: '12345678901',
      password: 'password123',
      roles: [Role.COURIER],
    }),
  })
  @ApiResponse(
    successResponse('User created successfully.', {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john.doe@example.com',
      cpf: '12345678901',
      roles: [Role.COURIER],
    }),
  )
  @ApiResponse(conflictResponse(`User with CPF "00.000.000-00" already exists`))
  @ApiResponse(badRequestResponse)
  async handle(@Body(bodyValidationPipe) body: RegisterUserBodySchema) {
    const { email, name, cpf, password, roles } = body;

    const createUserRequest = {
      name,
      email,
      cpf,
      password,
      roles: roles ?? [Role.COURIER],
    };

    const result = await this.createUser.execute(createUserRequest);

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}