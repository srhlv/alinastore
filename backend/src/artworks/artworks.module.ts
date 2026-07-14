import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';

@Module( {
  imports:     [ AdminAuthModule ],
  controllers: [ ArtworksController ],
  providers:   [ ArtworksService ],
  exports:     [ ArtworksService ],
} )
export class ArtworksModule {}
