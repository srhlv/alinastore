import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
}
