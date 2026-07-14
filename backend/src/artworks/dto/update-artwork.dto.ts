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
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titleUk?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titleEn?: string;

  @IsOptional()
  @IsString()
  descriptionUk?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested( { each: true } )
  @Type( () => CreateArtworkOptionDto )
  options?: CreateArtworkOptionDto[];
}
