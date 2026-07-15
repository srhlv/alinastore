import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags( 'admin-auth' )
@Controller( 'admin' )
export class AdminAuthController {
  constructor( private readonly adminAuthService: AdminAuthService ) {}

  @Post( 'login' )
  @ApiResponse( { status: 201, description: 'JWT access token issued' } )
  @ApiResponse( { status: 401, description: 'Invalid credentials' } )
  login( @Body() loginDto: LoginDto ): Promise<{ accessToken: string }> {
    return this.adminAuthService.login( loginDto.username, loginDto.password );
  }
}
