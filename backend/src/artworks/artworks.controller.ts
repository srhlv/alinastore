import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Photo } from '@prisma/client';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { AdminArtwork, ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdateArtworkStatusDto } from './dto/update-artwork-status.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@ApiTags( 'admin-artworks' )
@ApiBearerAuth()
@UseGuards( JwtAuthGuard )
@Controller( 'admin/artworks' )
export class ArtworksController {
  constructor( private readonly artworksService: ArtworksService ) {}

  @Get()
  @ApiResponse( { status: 200, description: 'All artworks including DELETED' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  findAll(): Promise<AdminArtwork[]> {
    return this.artworksService.findAll();
  }

  @Post()
  @ApiResponse( { status: 201, description: 'Artwork created with options' } )
  @ApiResponse( { status: 400, description: 'Validation failed' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  create( @Body() dto: CreateArtworkDto ): Promise<AdminArtwork> {
    return this.artworksService.create( dto );
  }

  @Put( ':id' )
  @ApiResponse( { status: 200, description: 'Artwork updated' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Artwork not found' } )
  update(
    @Param( 'id' ) id: string,
    @Body() dto: UpdateArtworkDto,
  ): Promise<AdminArtwork> {
    return this.artworksService.update( id, dto );
  }

  @Delete( ':id/permanent' )
  @HttpCode( HttpStatus.NO_CONTENT )
  @ApiResponse( { status: 204, description: 'Artwork permanently deleted' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Artwork not found' } )
  @ApiResponse( { status: 409, description: 'Artwork has orders and cannot be deleted' } )
  async hardRemove( @Param( 'id' ) id: string ): Promise<void> {
    await this.artworksService.hardRemove( id );
  }

  @Delete( ':id' )
  @ApiResponse( { status: 200, description: 'Artwork soft-deleted (DELETED)' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Artwork not found' } )
  remove( @Param( 'id' ) id: string ): Promise<AdminArtwork> {
    return this.artworksService.remove( id );
  }

  @Patch( ':id/status' )
  @ApiResponse( { status: 200, description: 'Artwork status updated' } )
  @ApiResponse( { status: 400, description: 'Validation failed' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Artwork not found' } )
  updateStatus(
    @Param( 'id' ) id: string,
    @Body() dto: UpdateArtworkStatusDto,
  ): Promise<AdminArtwork> {
    return this.artworksService.updateStatus( id, dto );
  }

  @Post( ':id/photos' )
  @ApiResponse( { status: 201, description: 'Photo added to artwork' } )
  @ApiResponse( { status: 400, description: 'Max photos exceeded or validation failed' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Artwork not found' } )
  addPhoto(
    @Param( 'id' ) id: string,
    @Body() dto: CreatePhotoDto,
  ): Promise<Photo> {
    return this.artworksService.addPhoto( id, dto );
  }

  @Delete( ':id/photos/:photoId' )
  @ApiResponse( { status: 200, description: 'Photo removed' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Photo not found' } )
  removePhoto(
    @Param( 'id' ) id: string,
    @Param( 'photoId' ) photoId: string,
  ): Promise<Photo> {
    return this.artworksService.removePhoto( id, photoId );
  }

  @Patch( ':id/photos/:photoId' )
  @ApiResponse( { status: 200, description: 'Photo metadata updated' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Photo not found' } )
  updatePhoto(
    @Param( 'id' ) id: string,
    @Param( 'photoId' ) photoId: string,
    @Body() dto: UpdatePhotoDto,
  ): Promise<Photo> {
    return this.artworksService.updatePhoto( id, photoId, dto );
  }
}
