import { NextRequest, NextResponse } from 'next/server';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export async function validateDto(
  req: NextRequest,
  dtoClass: any
): Promise<NextResponse | null> {
  const body = await req.json();
  const dto = plainToClass(dtoClass, body);
  const errors = await validate(dto);
  
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  
  return null;
}