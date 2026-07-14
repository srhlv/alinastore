import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { AdminArtwork, ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@UseGuards( JwtAuthGuard )
@Controller( 'admin/artworks' )
export class ArtworksController {
  constructor( private readonly artworksService: ArtworksService ) {}

  @Get()
  findAll(): Promise<AdminArtwork[]> {
    return this.artworksService.findAll();
  }

  @Post()
  create( @Body() dto: CreateArtworkDto ): Promise<AdminArtwork> {
    return this.artworksService.create( dto );
  }

  @Put( ':id' )
  update(
    @Param( 'id' ) id: string,
    @Body() dto: UpdateArtworkDto,
  ): Promise<AdminArtwork> {
    return this.artworksService.update( id, dto );
  }
}
