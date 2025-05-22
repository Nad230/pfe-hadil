import { IsOptional, IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  visibility?: string;
  @IsString()
  projectIds?: string[]
  @IsOptional()
  @IsUUID()
  userId?: string;
  @IsUUID()
  @IsNotEmpty()
  createdBy: string; 
}
