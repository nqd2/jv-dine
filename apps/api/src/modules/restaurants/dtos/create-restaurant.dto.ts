import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsInt()
  ownerId!: number;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  nameVn?: string | null;

  @IsOptional()
  @IsString()
  descriptionJa?: string | null;

  @IsOptional()
  @IsString()
  descriptionVn?: string | null;

  @IsString()
  @MinLength(1)
  address!: string;

  @IsOptional()
  @IsString()
  area?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  cuisine?: string | null;

  @IsOptional()
  @IsString()
  workingHours?: string | null;

  @IsOptional()
  minBudget?: string | number | null;

  @IsOptional()
  maxBudget?: string | number | null;

  @IsOptional()
  @IsBoolean()
  hasAirConditioner?: boolean;

  @IsOptional()
  @IsBoolean()
  isJapaneseFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWifi?: boolean;

  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @IsOptional()
  @IsBoolean()
  hasEnglishSupport?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsCards?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsReservations?: boolean;

  @IsOptional()
  @IsInt()
  cleanlinessLevel?: number | null;

  @IsOptional()
  @IsString()
  languages?: string | null;

  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @IsOptional()
  @IsNumber()
  long?: number | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
