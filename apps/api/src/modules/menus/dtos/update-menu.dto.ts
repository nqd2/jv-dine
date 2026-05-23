import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsInt()
  restaurantId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  itemName?: string;

  @IsOptional()
  @IsString()
  nameVn?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isJapaneseFriendly?: boolean;

  @IsOptional()
  @IsString()
  warningTags?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
