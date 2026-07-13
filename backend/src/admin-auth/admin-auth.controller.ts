import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from './dto/login.dto';

@Controller( 'admin' )
export class AdminAuthController {
  constructor( private readonly adminAuthService: AdminAuthService ) {}

  @Post( 'login' )
  login( @Body() loginDto: LoginDto ): Promise<{ accessToken: string }> {
    return this.adminAuthService.login( loginDto.username, loginDto.password );
  }
}
