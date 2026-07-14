import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { AdminArtwork, ArtworksService } from './artworks.service';

@UseGuards( JwtAuthGuard )
@Controller( 'admin/artworks' )
export class ArtworksController {
  constructor( private readonly artworksService: ArtworksService ) {}

  @Get()
  findAll(): Promise<AdminArtwork[]> {
    return this.artworksService.findAll();
  }
}
