import './load-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create( AppModule );

  const corsOrigins = ( process.env.CORS_ORIGINS ?? 'http://localhost:4200' )
    .split( ',' )
    .map( ( origin ) => origin.trim() )
    .filter( Boolean );

  app.enableCors( { origin: corsOrigins } );
  app.setGlobalPrefix( 'api' );
  app.useGlobalPipes(
    new ValidationPipe( {
      whitelist: true,
      transform: true,
    } ),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle( 'alina Art Store API' )
    .setDescription( 'Public storefront and admin API' )
    .setVersion( '1.0' )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument( app, swaggerConfig );
  SwaggerModule.setup( 'api/docs', app, document );

  await app.listen( process.env.PORT ?? 3000 );
}
void bootstrap();
