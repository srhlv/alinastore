import { Controller, Get, Param } from '@nestjs/common';
import {
  ArtworksService,
  PublicArtworkDetail,
  PublicArtworkListItem,
} from './artworks.service';

@Controller( 'public/artworks' )
export class PublicArtworksController {
  constructor( private readonly artworksService: ArtworksService ) {}

  @Get()
  findAll(): Promise<PublicArtworkListItem[]> {
    return this.artworksService.findPublicAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ): Promise<PublicArtworkDetail> {
    return this.artworksService.findPublicOne( id );
  }
}
