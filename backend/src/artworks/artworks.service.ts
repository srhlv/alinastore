import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';

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
}
