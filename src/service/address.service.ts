import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(createAddressDto: CreateAddressDto) {
    const { street, city, postalCode, country, userId } = createAddressDto;
  
    return this.prisma.address.create({
      data: {
        street,
        city,
        postalCode ,
        country,
        user: { connect: { id: userId } }, 
      },
    });
  }
  

  /*async update(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({ where: { id } });
  if (!address) {
    throw new NotFoundException(`Adresse avec l'id ${id} introuvable.`);
  }
    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
      
    });
  }*/
   
    
    async update(id: string, updateAddressDto: UpdateAddressDto) {
      try {
        const address = await this.prisma.address.findUnique({ where: { id } });
    
        if (!address) {
          throw new NotFoundException(`Adresse avec l'id ${id} introuvable.`);
        }
    
        return await this.prisma.address.update({
          where: { id },
          data: updateAddressDto,
        });
      } catch (error) {

        if (error instanceof PrismaClientKnownRequestError) {
          console.error('Erreur Prisma :', error.message);
          throw new NotFoundException(`Requête invalide : ${error.message}`);
        }
    
    //autre
        console.error('Erreur inconnue :', error);
        throw error;
      }
    }
    
  

  async remove(id: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) {
      throw new NotFoundException(`Adresse avec l'id ${id} non trouvée.`);
    }

    return this.prisma.address.delete({ where: { id } });
  }

  async getAllByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
    });
  }
  


  async getAll() {
    return this.prisma.address.findMany();
  }
  

}
