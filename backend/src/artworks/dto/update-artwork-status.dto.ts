import { ApiProperty } from '@nestjs/swagger';
import { ArtStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateArtworkStatusDto {
  @ApiProperty( { enum: ArtStatus, example: ArtStatus.SOLD } )
  @IsEnum( ArtStatus )
  status!: ArtStatus;
}
