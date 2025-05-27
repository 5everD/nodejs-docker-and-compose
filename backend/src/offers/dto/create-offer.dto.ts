import { IsBoolean, IsDecimal, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  itemId: number;
}
