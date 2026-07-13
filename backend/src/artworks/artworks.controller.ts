import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';

@UseGuards( JwtAuthGuard )
@Controller( 'admin/artworks' )
export class ArtworksController {
  @Get()
  findAll(): [] {
    return [];
  }
}
