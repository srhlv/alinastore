import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ArtworksService,
  PublicArtworkDetail,
  PublicArtworkListItem,
} from './artworks.service';

@ApiTags( 'public-artworks' )
@Controller( 'public/artworks' )
export class PublicArtworksController {
  constructor( private readonly artworksService: ArtworksService ) {}

  @Get()
  @ApiResponse( {
    status:      200,
    description: 'AVAILABLE and SOLD artworks with thumbnail and minOptionPrice',
  } )
  findAll(): Promise<PublicArtworkListItem[]> {
    return this.artworksService.findPublicAll();
  }

  @Get( ':id' )
  @ApiResponse( { status: 200, description: 'Artwork detail with photos and options' } )
  @ApiResponse( { status: 404, description: 'Artwork not found or DELETED' } )
  findOne( @Param( 'id' ) id: string ): Promise<PublicArtworkDetail> {
    return this.artworksService.findPublicOne( id );
  }
}
