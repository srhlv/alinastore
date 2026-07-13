import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateArtworkOptionDto {
  @IsString()
  @IsNotEmpty()
  nameUk!: string;

  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @IsOptional()
  @IsString()
  descriptionUk?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsNumber()
  @Min( 0 )
  price!: number;
}

export class CreateArtworkDto {
  @IsString()
  @IsNotEmpty()
  titleUk!: string;

  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @IsOptional()
  @IsString()
  descriptionUk?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsArray()
  @ValidateNested( { each: true } )
  @Type( () => CreateArtworkOptionDto )
  options!: CreateArtworkOptionDto[];
}
