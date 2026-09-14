import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  bookId!: string;

  @IsString()
  @MaxLength(300)
  borrowerName!: string;

  @Type(() => Date)
  @IsDate()
  borrowedAt!: Date;

  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
