import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePhotoDto {
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
