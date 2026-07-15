import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty( { example: 'art-1' } )
  @IsString()
  @IsNotEmpty()
  artworkId!: string;

  @ApiProperty( { example: 'opt-1' } )
  @IsString()
  @IsNotEmpty()
  optionId!: string;

  @ApiProperty( { example: 1, minimum: 1 } )
  @IsInt()
  @Min( 1 )
  @Type( () => Number )
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty( { example: 'Олена' } )
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty( { example: '@olena' } )
  @IsString()
  @IsNotEmpty()
  contactInfo!: string;

  @ApiProperty( { type: [ CreateOrderItemDto ], minItems: 1 } )
  @IsArray()
  @ArrayMinSize( 1 )
  @ValidateNested( { each: true } )
  @Type( () => CreateOrderItemDto )
  items!: CreateOrderItemDto[];
}
