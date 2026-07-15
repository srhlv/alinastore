import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  artworkId!: string;

  @IsString()
  @IsNotEmpty()
  optionId!: string;

  @IsInt()
  @Min( 1 )
  @Type( () => Number )
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  contactInfo!: string;

  @IsArray()
  @ArrayMinSize( 1 )
  @ValidateNested( { each: true } )
  @Type( () => CreateOrderItemDto )
  items!: CreateOrderItemDto[];
}
