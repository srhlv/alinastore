import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePhotoDto {
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
