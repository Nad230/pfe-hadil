import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-clientdialog.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {

  constructor(private prisma: PrismaService) {}




     async createClient(data: CreateClientDto, userId: string) {
  try {
    // Step 1: Create the client
    const client = await this.prisma.client.create({
      data: {
        name: data.name,
        visibility: data.visibility,
        ...(data.userId && {
          user: { connect: { id: data.userId } }
        }),
        creator: {
          connect: {
            id: userId,
          },
        },
      },
    });

    // Step 2 (optional): Link the client to projects if projectIds are provided
    if (data.projectIds && data.projectIds.length > 0) {
      const links = data.projectIds.map(projectId => ({
        clientId: client.id,
        projectId,
      }));

      await this.prisma.clientProject.createMany({
        data: links,
        skipDuplicates: true,
      });
    }

    return client;
  } catch (error) {
    console.error("Failed to create client:", error);
    throw new Error("Could not create client");
  }
}

async deleteClient(clientId: string, deleteInvoices = false) {
  try {
    if (deleteInvoices) {
      // 1. Get all invoices for the client
      const invoices = await this.prisma.invoice.findMany({
        where: { clientId },
        select: { id: true },
      });

      const invoiceIds = invoices.map(inv => inv.id);

      if (invoiceIds.length > 0) {
        // 2. Delete all invoice items linked to these invoices
        await this.prisma.invoiceItem.deleteMany({
          where: { invoiceId: { in: invoiceIds } },
        });

        // 3. Delete all sale digital entries linked to these invoices
        await this.prisma.saleDigital.deleteMany({
          where: { invoiceId: { in: invoiceIds } },
        });

        // 4. Delete invoices
        await this.prisma.invoice.deleteMany({
          where: { id: { in: invoiceIds } },
        });
      }
    } else {
      const count = await this.prisma.invoice.count({ where: { clientId } });
      if (count > 0) {
        throw new Error("Client has invoices. Set deleteInvoices to true if you want to remove them.");
      }
    }

    // 5. Delete related clientProjects
    await this.prisma.clientProject.deleteMany({
      where: { clientId },
    });

    // 6. Finally, delete the client
    await this.prisma.client.delete({
      where: { id: clientId },
    });

    return { message: "Client deleted successfully" };
  } catch (error) {
    console.error("Failed to delete client:", error);
    throw new Error("Could not delete client");
  }
}




async getProjectsByClient(clientId: string) {
  try {
    const clientProjects = await this.prisma.clientProject.findMany({
      where: { clientId },
      include: {
        project: true, // Include full project data
      },
    });

    // Return just the project objects
    return clientProjects.map((cp) => cp.project);
  } catch (error) {
    console.error("Failed to fetch projects by client:", error);
    throw new Error("Could not fetch projects for this client");
  }
}

async unlinkClientFromProject(clientId: string, projectId: string) {
  try {
    await this.prisma.clientProject.delete({
      where: {
        clientId_projectId: {
          clientId,
          projectId,
        },
      },
    });

    return { message: "Client unlinked from project successfully" };
  } catch (error) {
    console.error("Failed to unlink client from project:", error);
    throw new Error("Could not unlink this client from the project");
  }
}

async unlinkAllClientsFromProject(projectId: string) {
  try {
    const deleted = await this.prisma.clientProject.deleteMany({
      where: { projectId },
    });

    return { message: `Unlinked ${deleted.count} clients from project` };
  } catch (error) {
    console.error("Failed to unlink clients from project:", error);
    throw new Error("Could not unlink clients from project");
  }
}

async getClientsByProject(projectId: string) {
  try {
    const clientProjects = await this.prisma.clientProject.findMany({
      where: { projectId },
      include: {
        client: true, // Include full client info
      },
    });

    // Extract just the client info
    return clientProjects.map((cp) => cp.client);
  } catch (error) {
    console.error("Failed to fetch clients by project:", error);
    throw new Error("Could not fetch clients for this project");
  }
}


 

  async getClientsForUser(userId: string) {
  return this.prisma.client.findMany({
    where: {
      OR: [
        {
          // Public clients (visible to everyone)
          visibility: 'public',
        },
        {
          // Private clients created by the user
          visibility: 'private',
          createdBy: userId
        }
      ]
    },
    include: {
      projects: true,
      Invoice: {
        include: {
          items: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}





      async updateClient(dto: UpdateClientDto, userId: string) {
        const { id, name, visibility, userId: linkUserId } = dto;
        const data: any = {};
    
        if (name  !== undefined) data.name  = name;
        if (visibility !== undefined) data.visibility = visibility;
    
        if (linkUserId !== undefined) {
          data.user = { connect: { id: linkUserId } };
        }
    
        // Only update if the client was created by this user
        const result = await this.prisma.client.updateMany({
          where: { id, createdBy: userId },
          data,
        });
    
        if (result.count === 0) {
          throw new NotFoundException(
            'Client not found or you do not have permission to update it'
          );
        }
    
        // Return the updated client
        return this.prisma.client.findUnique({
          where: { id },
        });
      }
    
}
