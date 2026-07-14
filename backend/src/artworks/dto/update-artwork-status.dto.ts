import { ArtStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateArtworkStatusDto {
  @IsEnum( ArtStatus )
  status!: ArtStatus;
}
