import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
import { AddressResponseDto } from 'src/models/dto/address-response.dto';
import { Address } from '@prisma/client';


@Injectable()


export class AddressService {
  async findUnique(addressId: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id: addressId },
    });
  }
  constructor(private prisma: PrismaService) { }


  private transformToAddressResponseDto(address: Address & { user?: { name: string } }): AddressResponseDto {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      userId: address.userId,
      userName: address.user?.name,
    };
  }



  async isChildOfParent(parentId: string, childId: string): Promise<boolean> {
    const child = await this.prisma.user.findFirst({
      where: {
        id: childId,
        parentId: parentId,
      },
    });
    return !!child;
  }

  async createForUser(createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {
    const { street, city, postalCode, country, userId } = createAddressDto;

    const address = await this.prisma.address.create({
      data: {
        street,
        city,
        postalCode,
        country,
        user: { connect: { id: userId } },
      },
    });

    return this.transformToAddressResponseDto(address);
  }

  async createForChild(createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {
    const address = await this.prisma.address.create({
      data: {
        street: createAddressDto.street,
        city: createAddressDto.city,
        postalCode: createAddressDto.postalCode,
        country: createAddressDto.country,
        user: { connect: { id: createAddressDto.userId } },
      },
    });

    return this.transformToAddressResponseDto(address);
  }


  async update(
    addressId: string,
    updateAddressDto: UpdateAddressDto,
    userId: string
  ): Promise<AddressResponseDto | null | 'FORBIDDEN' | 'OWNER_NOT_FOUND'> {
    // Adresse existe ?
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return null;
    }

    //  Propriétaire de l'adresse existe ?
    const addressOwner = await this.prisma.user.findUnique({
      where: { id: address.userId },
    });

    if (!addressOwner) {
      return 'OWNER_NOT_FOUND';
    }

    // Soit propriétaire, soit parent
    const isOwner = address.userId === userId;
    const isParent = addressOwner.parentId === userId;

    if (!isOwner && !isParent) {
      return 'FORBIDDEN';  // Pas autorisé
    }

    // Mise à jour
    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: updateAddressDto,
    });

    return this.transformToAddressResponseDto(updated);
  }




  async getById(id: string): Promise<AddressResponseDto & { userId: string }> {
    const address = await this.prisma.address.findUnique({ where: { id } });

    if (!address) {
      return null;
    }


    return {
      ...this.transformToAddressResponseDto(address),
      userId: address.userId,
    };
  }




  async remove(addressId: string, userId: string): Promise<AddressResponseDto | null | 'OWNER_NOT_FOUND' | 'FORBIDDEN'> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return null;
    }

    const addressOwner = await this.prisma.user.findUnique({
      where: { id: address.userId },
    });

    if (!addressOwner) {
      return 'OWNER_NOT_FOUND';
    }

    const isOwner = address.userId === userId;
    const isParent = addressOwner.parentId === userId;

    if (!isOwner && !isParent) {
      return 'FORBIDDEN'; // Pas autorisé à supprimer
    }



    const deleted = await this.prisma.address.delete({
      where: { id: addressId },
    });
    return this.transformToAddressResponseDto(deleted);



  }





  async getAllByUserWithPermission(requesterId: string, targetUserId: string): Promise<AddressResponseDto[] | 'FORBIDDEN'> {
    const isOwner = requesterId === targetUserId;
    const isParent = await this.isChildOfParent(requesterId, targetUserId);

    if (!isOwner && !isParent) {
      return 'FORBIDDEN'; // Plus d'exception ici
    }

    const addresses = await this.getAllByUser(targetUserId);
    return addresses.map((a) => this.transformToAddressResponseDto(a));
  }


  async getAllByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
    });
  }

  async getPaginatedAddresses(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const totalCount = await this.prisma.address.count();
    const data = await this.prisma.address.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        postalCode: 'asc',
      },
    });
    const pageCount = Math.ceil(totalCount / limit);

    return { data, pageCount, resultCount: totalCount };
  }



  async getAll() {
    const addresses = await this.prisma.address.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return addresses.map((address) => ({
      id: address.id,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      userId: address.userId,
      userName: address.user.name,
      createdAt: address.createdAt,
    }));
  }

  async getPaginatedByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const totalCount = await this.prisma.address.count({
      where: { userId },
    });

    const data = await this.prisma.address.findMany({
      where: { userId },
      skip: offset,
      take: limit,
      orderBy: { postalCode: 'asc' },
    });

    const pageCount = Math.ceil(totalCount / limit);

    return {
      data,
      page,
      totalPages: pageCount,
      totalItems: totalCount,
    };
  }

  async getAllForUserAndChildren(userId: string) {
    return this.prisma.address.findMany({
      where: {
        OR: [
          { userId: userId },
          { user: { parentId: userId } },
        ],
      },
      include: { user: true },
    });
  }

}

