import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module( {
  controllers: [ AdminAuthController ],
  providers:   [ AdminAuthService, JwtAuthGuard ],
  exports:     [ AdminAuthService, JwtAuthGuard ],
} )
export class AdminAuthModule {}
