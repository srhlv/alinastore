import './load-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

  await app.listen( process.env.PORT ?? 3000 );
}
void bootstrap();
