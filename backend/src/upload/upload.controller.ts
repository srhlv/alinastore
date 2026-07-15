import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { UploadService } from './upload.service';

@ApiTags( 'admin-upload' )
@ApiBearerAuth()
@UseGuards( JwtAuthGuard )
@Controller( 'admin/upload' )
export class UploadController {
  constructor( private readonly uploadService: UploadService ) {}

  @Post()
  @ApiConsumes( 'multipart/form-data' )
  @ApiBody( {
    schema: {
      type:       'object',
      required:   [ 'file' ],
      properties: {
        file: {
          type:        'string',
          format:      'binary',
          description: 'Image file (max 10 MB)',
        },
      },
    },
  } )
  @ApiResponse( { status: 201, description: 'File uploaded; public URL returned' } )
  @ApiResponse( { status: 400, description: 'Missing or invalid file' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @UseInterceptors(
    FileInterceptor( 'file', {
      storage: memoryStorage(),
      limits:  { fileSize: 10 * 1024 * 1024 },
    } ),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string }> {
    return this.uploadService.upload( file );
  }
}
