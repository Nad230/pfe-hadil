import { IsString, IsDate, IsOptional } from 'class-validator';

export class CreateSaleDigitalDto {
  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsDate()
  date?: Date;
}