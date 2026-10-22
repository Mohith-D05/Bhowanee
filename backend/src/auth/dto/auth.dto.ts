import { IsString, IsEnum, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RequestOtpDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a 10-digit Indian mobile number.' })
  phone!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits.' })
  code!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
