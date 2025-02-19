import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { InvalidAttachmentTypeError } from '@/domain/delivery/application/use-cases/errors/invalid-attachment-type-error'
import { UploadAndCreateAttachmentUseCase } from '@/domain/delivery/application/use-cases/upload-and-create-attachment'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger'
import { successResponse } from '@/swagger/responses/sucess.response'
import { badRequestResponse } from '@/swagger/responses/bad-request.response'

@ApiTags('Attachments')
@Controller('/attachments')
export class UploadAttachmentController {
  constructor(
    private uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Upload an attachment',
    description:
      'Uploads a file (PNG, JPG, JPEG, or PDF) with a maximum size of 2MB and creates an attachment record.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse(
    successResponse('Attachment uploaded successfully.', {
      attachmentId: '123e4567-e89b-12d3-a456-426614174000',
    }),
  )
  @ApiResponse(
    badRequestResponse(
      'Invalid file type or size. Supported types: PNG, JPG, JPEG, PDF. Maximum size: 2MB.',
    ),
  )
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2MB
          }),
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadAndCreateAttachment.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { attachment } = result.value
    return {
      attachmentId: attachment.id.toString(),
    }
  }
}
