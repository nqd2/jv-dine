import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(1)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  passwordConfirmation?: string;

  @IsOptional()
  @IsIn(['customer', 'owner'])
  userType?: 'customer' | 'owner';

  @IsOptional()
  @IsBoolean()
  acceptedTerms?: boolean;

  @IsOptional()
  @IsString()
  allergyInfo?: string | null;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
