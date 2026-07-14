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
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsBoolean()
  @Type( () => Boolean )
  isMain?: boolean;

  @IsOptional()
  @IsInt()
  @Min( 0 )
  @Type( () => Number )
  sortOrder?: number;
}
