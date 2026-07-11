import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/upload')
export class UploadController {
  @Post()
  upload(): { url: string } {
    return { url: '' };
  }
}
