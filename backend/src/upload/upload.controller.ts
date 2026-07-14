import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { UploadService } from './upload.service';

@UseGuards( JwtAuthGuard )
@Controller( 'admin/upload' )
export class UploadController {
  constructor( private readonly uploadService: UploadService ) {}

  @Post()
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
