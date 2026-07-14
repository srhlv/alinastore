import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Photo } from '@prisma/client';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { AdminArtwork, ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdateArtworkStatusDto } from './dto/update-artwork-status.dto';
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

  @Delete( ':id' )
  remove( @Param( 'id' ) id: string ): Promise<AdminArtwork> {
    return this.artworksService.remove( id );
  }

  @Patch( ':id/status' )
  updateStatus(
    @Param( 'id' ) id: string,
    @Body() dto: UpdateArtworkStatusDto,
  ): Promise<AdminArtwork> {
    return this.artworksService.updateStatus( id, dto );
  }

  @Post( ':id/photos' )
  addPhoto(
    @Param( 'id' ) id: string,
    @Body() dto: CreatePhotoDto,
  ): Promise<Photo> {
    return this.artworksService.addPhoto( id, dto );
  }

  @Delete( ':id/photos/:photoId' )
  removePhoto(
    @Param( 'id' ) id: string,
    @Param( 'photoId' ) photoId: string,
  ): Promise<Photo> {
    return this.artworksService.removePhoto( id, photoId );
  }
}
