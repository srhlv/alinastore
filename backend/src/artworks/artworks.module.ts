import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { ArtworksController } from './artworks.controller';

@Module( {
  imports:     [ AdminAuthModule ],
  controllers: [ ArtworksController ],
} )
export class ArtworksModule {}
