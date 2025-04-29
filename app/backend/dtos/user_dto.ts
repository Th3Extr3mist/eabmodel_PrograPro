import { IsEmail, IsString, IsOptional, IsInt, isString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

export class CreateUserDto {
    @IsEmail()
    email!: string;
  
    @IsString()
    user_name!: string;
  
    @IsString()
    user_password!: string;
  
    @IsOptional()
    @IsInt()
    age?: number;

    @IsOptional()
    salt?: string | null;

    @IsOptional()
    hash?: string | null;
  }
export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString()
    user_name?: string;
  
    @IsOptional()
    @IsString()
    user_password?: string;
  
    @IsOptional()
    @IsInt()
    age?: number;
  }

@Expose()
export class UserResponseDto {
  user_id: string;
  email: string;
  user_name: string;
  age?: number;
}