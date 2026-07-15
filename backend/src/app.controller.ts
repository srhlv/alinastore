import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags( 'app' )
@Controller()
export class AppController {
  constructor( private readonly appService: AppService ) {}

  @Get()
  @ApiResponse( { status: 200, description: 'Health / hello' } )
  getHello(): string {
    return this.appService.getHello();
  }
}
