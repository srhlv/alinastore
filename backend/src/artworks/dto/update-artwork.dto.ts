import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateArtworkOptionDto } from './create-artwork.dto';

export class UpdateArtworkDto {
  @ApiPropertyOptional( { example: 'Картина' } )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titleUk?: string;

  @ApiPropertyOptional( { example: 'Painting' } )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionUk?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional( { type: [ CreateArtworkOptionDto ] } )
  @IsOptional()
  @IsArray()
  @ValidateNested( { each: true } )
  @Type( () => CreateArtworkOptionDto )
  options?: CreateArtworkOptionDto[];
}
