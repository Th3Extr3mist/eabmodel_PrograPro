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

    @IsOptional()
    preference_1? :string;
    
    @IsOptional()
    preference_2? :string;

    @IsOptional()
    preference_3? :string;
    
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

    @IsOptional()
    @IsString()
    preference_1? :string;

    @IsOptional()
    @IsString()
    preference_2? :string;

    @IsOptional()
    @IsString()
    preference_3? :string;
  }

@Expose()
export class UserResponseDto {
  user_id: string;
  email: string;
  user_name: string;
  age?: number;
  preference_1?: string;
  preference_2?: string;
  preference_3?: string;
}