import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMenuDto {
  @IsInt()
  restaurantId!: number;

  @IsString()
  @MinLength(1)
  itemName!: string;

  @IsOptional()
  @IsString()
  nameVn?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsNumber()
  price!: number;

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
