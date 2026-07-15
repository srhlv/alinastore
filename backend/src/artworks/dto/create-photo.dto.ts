import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePhotoDto {
  @ApiProperty( { example: 'https://cdn.example/a.jpg' } )
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional( { example: true } )
  @IsOptional()
  @IsBoolean()
  @Type( () => Boolean )
  isMain?: boolean;

  @ApiPropertyOptional( { example: 0, minimum: 0 } )
  @IsOptional()
  @IsInt()
  @Min( 0 )
  @Type( () => Number )
  sortOrder?: number;
}
