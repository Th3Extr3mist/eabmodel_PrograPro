import { Expose } from 'class-transformer';
import {IsString, IsInt, IsDateString, IsNumber, Min, IsOptional, Matches} from 'class-validator';

export class CreateEventDto {
  @IsString()
  event_name!: string;

  @IsString()
  @Matches(/^[\p{L}\d\s.,-]{10,500}$/u, { // Permite letras acentuadas
    message: 'Descripción debe tener 10-500 caracteres (solo letras, números, ., -)'
  })
  description!: string;

  @IsOptional()
  @IsString()
  preference_1?: string;

  @IsOptional()
  @IsString()
  preference_2?: string;

  @IsOptional()
  @IsString()
  preference_3?: string;

  @IsOptional()
  @IsString()
  weather_preference?: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  event_date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start_time!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end_time!: string;

  @IsInt()
  organizer_id!: number;

  @IsInt()
  location_id!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  availability?: number;

  @IsNumber()
  lat:number;

  @IsNumber()
  lng:number;

  @IsOptional()
  @IsString()
  image?:string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  event_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  preference_1?: string;

  @IsOptional()
  @IsString()
  preference_2?: string;

  @IsOptional()
  @IsString()
  preference_3?: string;

  @IsOptional()
  @IsString()
  weather_preference?: string;

  @IsOptional()
  @IsDateString()
  event_date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsInt()
  organizer_id?: number;

  @IsOptional()
  @IsInt()
  location_id?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  availability?: number;

  @IsOptional()
  @IsNumber()
  lat?:number;

  @IsOptional()
  @IsNumber()
  lng?:number;

  @IsOptional()
  @IsString()
  image?:string;
}

export class EventResponseDto {
  @Expose()
  event_id!: number;

  @Expose()
  event_name!: string;

  @Expose()
  description!: string;

  @Expose()
  preference_1?: string;

  @Expose()
  preference_2?: string;

  @Expose()
  preference_3?: string;

  @Expose()
  weather_preference?: string;

  @Expose()
  event_date!: string;

  @Expose()
  start_time!: string;

  @Expose()
  end_time!: string;

  @Expose()
  organizer_id!: number;

  @Expose()
  location_id!: number;

  @Expose()
  price!: number;

  @Expose()
  availability?: number;

  @Expose()
  lat?:number;

  @Expose()
  lng?:number;

  @Expose()
  image?:string
}