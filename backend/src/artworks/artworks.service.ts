import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Photo, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdateArtworkStatusDto } from './dto/update-artwork-status.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

const MAX_PHOTOS_PER_ARTWORK = 5;

const artworkAdminInclude = {
  photos:  { orderBy: { sortOrder: 'asc' as const } },
  options: true,
} satisfies Prisma.ArtworkInclude;

export type AdminArtwork = Prisma.ArtworkGetPayload<{
  include: typeof artworkAdminInclude;
}>;

@Injectable()
export class ArtworksService {
  constructor( private readonly prisma: PrismaService ) {}

  findAll(): Promise<AdminArtwork[]> {
    return this.prisma.artwork.findMany( {
      include: artworkAdminInclude,
      orderBy: { createdAt: 'desc' },
    } );
  }

  create( dto: CreateArtworkDto ): Promise<AdminArtwork> {
    return this.prisma.artwork.create( {
      data: {
        titleUk:       dto.titleUk,
        titleEn:       dto.titleEn,
        descriptionUk: dto.descriptionUk,
        descriptionEn: dto.descriptionEn,
        options:       {
          create: dto.options.map( ( option ) => ( {
            nameUk:        option.nameUk,
            nameEn:        option.nameEn,
            descriptionUk: option.descriptionUk,
            descriptionEn: option.descriptionEn,
            price:         option.price,
          } ) ),
        },
      },
      include: artworkAdminInclude,
    } );
  }

  async update( id: string, dto: UpdateArtworkDto ): Promise<AdminArtwork> {
    const existing = await this.prisma.artwork.findUnique( { where: { id } } );

    if ( !existing ) {
      throw new NotFoundException( `Artwork ${ id } not found` );
    }

    return this.prisma.artwork.update( {
      where: { id },
      data:  {
        ...( dto.titleUk !== undefined && { titleUk: dto.titleUk } ),
        ...( dto.titleEn !== undefined && { titleEn: dto.titleEn } ),
        ...( dto.descriptionUk !== undefined && { descriptionUk: dto.descriptionUk } ),
        ...( dto.descriptionEn !== undefined && { descriptionEn: dto.descriptionEn } ),
        ...( dto.options !== undefined && {
          options: {
            deleteMany: {},
            create:     dto.options.map( ( option ) => ( {
              nameUk:        option.nameUk,
              nameEn:        option.nameEn,
              descriptionUk: option.descriptionUk,
              descriptionEn: option.descriptionEn,
              price:         option.price,
            } ) ),
          },
        } ),
      },
      include: artworkAdminInclude,
    } );
  }

  async remove( id: string ): Promise<AdminArtwork> {
    const existing = await this.prisma.artwork.findUnique( { where: { id } } );

    if ( !existing ) {
      throw new NotFoundException( `Artwork ${ id } not found` );
    }

    return this.prisma.artwork.update( {
      where:   { id },
      data:    { status: 'DELETED' },
      include: artworkAdminInclude,
    } );
  }

  async updateStatus( id: string, dto: UpdateArtworkStatusDto ): Promise<AdminArtwork> {
    const existing = await this.prisma.artwork.findUnique( { where: { id } } );

    if ( !existing ) {
      throw new NotFoundException( `Artwork ${ id } not found` );
    }

    return this.prisma.artwork.update( {
      where:   { id },
      data:    { status: dto.status },
      include: artworkAdminInclude,
    } );
  }

  async addPhoto( artworkId: string, dto: CreatePhotoDto ): Promise<Photo> {
    const artwork = await this.prisma.artwork.findUnique( {
      where:   { id: artworkId },
      include: { photos: true },
    } );

    if ( !artwork ) {
      throw new NotFoundException( `Artwork ${ artworkId } not found` );
    }

    if ( artwork.photos.length >= MAX_PHOTOS_PER_ARTWORK ) {
      throw new BadRequestException(
        `Artwork may have at most ${ MAX_PHOTOS_PER_ARTWORK } photos`,
      );
    }

    const sortOrder = dto.sortOrder ?? artwork.photos.length;
    const isMain    = dto.isMain ?? false;

    if ( isMain ) {
      return this.prisma.$transaction( async ( tx ) => {
        await tx.photo.updateMany( {
          where: { artworkId, isMain: true },
          data:  { isMain: false },
        } );

        return tx.photo.create( {
          data: {
            url:      dto.url,
            isMain:   true,
            sortOrder,
            artworkId,
          },
        } );
      } );
    }

    return this.prisma.photo.create( {
      data: {
        url: dto.url,
        isMain,
        sortOrder,
        artworkId,
      },
    } );
  }

  async removePhoto( artworkId: string, photoId: string ): Promise<Photo> {
    const photo = await this.prisma.photo.findFirst( {
      where: { id: photoId, artworkId },
    } );

    if ( !photo ) {
      throw new NotFoundException(
        `Photo ${ photoId } not found for artwork ${ artworkId }`,
      );
    }

    return this.prisma.photo.delete( { where: { id: photoId } } );
  }

  async updatePhoto(
    artworkId: string,
    photoId: string,
    dto: UpdatePhotoDto,
  ): Promise<Photo> {
    const photo = await this.prisma.photo.findFirst( {
      where: { id: photoId, artworkId },
    } );

    if ( !photo ) {
      throw new NotFoundException(
        `Photo ${ photoId } not found for artwork ${ artworkId }`,
      );
    }

    if ( dto.isMain === true ) {
      return this.prisma.$transaction( async ( tx ) => {
        await tx.photo.updateMany( {
          where: { artworkId, isMain: true, NOT: { id: photoId } },
          data:  { isMain: false },
        } );

        return tx.photo.update( {
          where: { id: photoId },
          data:  {
            isMain: true,
            ...( dto.sortOrder !== undefined && { sortOrder: dto.sortOrder } ),
          },
        } );
      } );
    }

    return this.prisma.photo.update( {
      where: { id: photoId },
      data:  {
        ...( dto.isMain !== undefined && { isMain: dto.isMain } ),
        ...( dto.sortOrder !== undefined && { sortOrder: dto.sortOrder } ),
      },
    } );
  }
}
