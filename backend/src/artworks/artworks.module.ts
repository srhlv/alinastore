import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';
import { PublicArtworksController } from './public-artworks.controller';

@Module( {
  imports:     [ AdminAuthModule ],
  controllers: [ ArtworksController, PublicArtworksController ],
  providers:   [ ArtworksService ],
  exports:     [ ArtworksService ],
} )
export class ArtworksModule {}
