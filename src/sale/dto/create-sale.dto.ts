import { IsString, IsInt, IsDateString } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  productId: string;
  @IsString()
  invoiceId: string;


  
  @IsInt()
  quantity: number;

  @IsDateString()
  date: string; // Expecting ISO format string like "2025-04-18"
}
