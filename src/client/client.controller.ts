import { Controller, UseGuards ,Post,Body,Request,Get, Param, Patch, InternalServerErrorException, NotFoundException, Delete, Query, HttpException, HttpStatus} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-clientdialog.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('client')
export class ClientController {
    citationService: any;

      constructor(private readonly clientService: ClientService) {}

     @UseGuards(JwtAuthGuard)   
       @Post()
        create( @Body() dto: CreateClientDto,@Request() req) {
          return this.clientService.createClient(dto,req.user.sub);
        }



         @UseGuards(JwtAuthGuard)
        @Get(":id/projects")
        async getProjectsByClient(@Param('id') id: string) {
            return this.clientService.getProjectsByClient(id);
        }
    
@Delete(':id')
  async deleteClient(
    @Param('id') clientId: string,
    @Query('deleteInvoices') deleteInvoices: string 
  ) {
    try {
      const shouldDeleteInvoices = deleteInvoices === 'true';
      const result = await this.clientService.deleteClient(clientId, shouldDeleteInvoices);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


    @UseGuards(JwtAuthGuard)
        @Get()
        async getTasksByAssignee(@Request() req) {
            return this.clientService.getClientsForUser(req.user.sub);
        }
    
        @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @Request() req,
  ) {
    if (dto.id !== id) {
      throw new NotFoundException('Client ID mismatch');
    }

    const userId = req.user.id; // from JWT payload
    return this.clientService.updateClient(dto, userId);
  }

}
