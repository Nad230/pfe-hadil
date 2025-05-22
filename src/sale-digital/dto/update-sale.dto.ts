
import { IsString, IsInt, IsDateString, IsOptional, IsDate } from 'class-validator';

export class UpdateSaleDigitalDto {
  @IsString()
   invoiceId: string;
 
   @IsOptional()
   @IsDate()
   date?: Date;
}
