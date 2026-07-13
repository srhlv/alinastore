import { Module } from '@nestjs/common';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtworksModule } from './artworks/artworks.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';

@Module( {
  imports: [
    PrismaModule,
    AdminAuthModule,
    ArtworksModule,
    OrdersModule,
    UploadModule,
  ],
  controllers: [ AppController ],
  providers:   [ AppService ],
} )
export class AppModule {}
