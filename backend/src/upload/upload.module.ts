import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module( {
  imports:     [ AdminAuthModule ],
  controllers: [ UploadController ],
  providers:   [ UploadService ],
  exports:     [ UploadService ],
} )
export class UploadModule {}
