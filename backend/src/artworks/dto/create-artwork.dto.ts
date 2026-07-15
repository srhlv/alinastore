import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty( { example: 'Оригінал' } )
  @IsString()
  @IsNotEmpty()
  nameUk!: string;

  @ApiProperty( { example: 'Original' } )
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionUk?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty( { example: 1500, minimum: 0 } )
  @IsNumber()
  @Min( 0 )
  price!: number;
}

export class CreateArtworkDto {
  @ApiProperty( { example: 'Картина' } )
  @IsString()
  @IsNotEmpty()
  titleUk!: string;

  @ApiProperty( { example: 'Painting' } )
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionUk?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty( { type: [ CreateArtworkOptionDto ] } )
  @IsArray()
  @ValidateNested( { each: true } )
  @Type( () => CreateArtworkOptionDto )
  options!: CreateArtworkOptionDto[];
}
