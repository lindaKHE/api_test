import {
  Controller, Post, Body, Patch, Param, Delete, Get, UseGuards,
  Query, Res, ForbiddenException, NotFoundException, InternalServerErrorException
} from '@nestjs/common';
import { AddressService } from '../service/address.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
import { BasicAuthGuard } from 'src/modules/auth/auth.guard';
import { AddressResponseDto } from 'src/models/dto/address-response.dto';
import { UserService } from 'src/service/user.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { PrismaService } from 'src/modules/prisma';
import { AdminBasicAuthGuard } from 'src/modules/auth/admin-basic-auth.guard';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ApiParam } from '@nestjs/swagger';

import { ApiBasicAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedAddressResponseDto } from 'src/models/paginated-address-response.dto';

@ApiTags('Addresses')
@ApiBasicAuth('basic-auth')
@UseGuards(BasicAuthGuard)
@Controller('address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) { }

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des adresses',
    type: PaginatedAddressResponseDto,
  })
  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Créer une adresse pour soi-même' })
  @ApiResponse({
    status: 201, description: 'addresse créé', type: AddressResponseDto, example: {
      "id": "530fe065-0dc4-48ce-9810-b7d5b23285c7",
      "street": "Bourguiba ",
      "city": "paris",
      "postalCode": "10001",
      "country": "France",
    }
  })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async createAddressForSelf(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() currentUser: any,
  ): Promise<AddressResponseDto> {
    try {
      createAddressDto.userId = currentUser.id;
      return await this.addressService.createForUser(createAddressDto);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException('Erreur lors de la création de l\'adresse');
    }
  }



  @Get(':id')
  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Récupérer une adresse par son ID' })
  @ApiResponse({ status: 200, description: 'Adresse trouvée', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Adresse non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async getAddressById(
    @Param('id') addressId: string,
    @CurrentUser() currentUser: any,
  ): Promise<AddressResponseDto> {
    const address = await this.addressService.getById(addressId);
  
    if (!address) {
      throw new NotFoundException('Adresse non trouvée');
    }
  
    if (address.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Accès interdit à cette adresse');
    }
  
    return address;
  }

  @Post(':userId')
  @UseGuards(BasicAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des adresses',
    type: PaginatedAddressResponseDto,
  })
  @ApiOperation({ summary: 'Créer une adresse pour un enfant' })
  @ApiResponse({ status: 201, type: AddressResponseDto })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Enfant introuvable' })
  async createAddressForChild(
    @Param('userId') userId: string,
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() currentUser: any,
  ): Promise<AddressResponseDto> {
    const child = await this.prisma.user.findUnique({ where: { id: userId } });
  
    if (!child) {
      throw new NotFoundException('Enfant non trouvé');
    }
  
    if (child.parentId !== currentUser.id) {
      throw new ForbiddenException('Pas autorisé a ajouté une adresse a ce compte ( que le parent de ce user )');
    }
  
    createAddressDto.userId = userId;
  
    return this.addressService.createForUser(createAddressDto);
  }
  


  @UseGuards(AdminBasicAuthGuard)
  @Get('user/:id')
  @ApiOperation({ summary: 'Lister les adresses par utilisateur avec pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Liste paginée des adresses' })
  async getPaginatedAddresses(
    @Param('id') userId: string,
    @Res() res: Response,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<void> {
    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
    if (isNaN(limitNumber) || limitNumber < 1) limitNumber = 10;

    const { data, totalPages, totalItems } = await this.addressService.getPaginatedByUser(
      userId,
      pageNumber,
      limitNumber,
    );

    res.setHeader('number-of-page', pageNumber.toString());
    res.setHeader('page-count', totalPages.toString());
    res.setHeader('result-count', totalItems.toString());

    res.status(200).json({
      data,
      page: pageNumber,
      totalPages,
      totalItems,
    });
  }

  @Patch(':id')

  @ApiOperation({ summary: 'Modifier une adresse existante ' })
  @ApiResponse({ status: 200, description: 'Adresse modifiée avec succès', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Adresse non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 400, description: 'Données invalides' })

  @ApiParam({ name: 'id', description: 'ID de l’adresse à modifier', type: String })

  @UseGuards(BasicAuthGuard)
  async update(
    @Param('id') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: any
  ): Promise<AddressResponseDto> {
    try {
      const result = await this.addressService.update(addressId, updateAddressDto, user.id);
  
      if (result === null) {
        throw new NotFoundException(`Adresse avec l'id ${addressId} non trouvée.`);
      }
  
      if (result === 'OWNER_NOT_FOUND') {
        throw new NotFoundException("Utilisateur propriétaire de l'adresse introuvable.");
      }
  
      if (result === 'FORBIDDEN') {
        throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cette adresse.");
      }
  
      return result;  // résultat valide (AddressResponseDto)
  
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error('Erreur Prisma :', error.message);
        throw new NotFoundException(`Requête invalide : ${error.message}`);
      }
  
      console.error('[PATCH] Erreur inconnue :', error);
      throw error;
    }
  }
  


  @Delete(':id')
  @UseGuards(AdminBasicAuthGuard)
  @ApiOperation({ summary: 'Supprimer une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse supprimée avec succès', type: AddressResponseDto })
  @ApiResponse({ status: 403, description: 'Accès interdit (non propriétaire ou non parent)' })

  @ApiResponse({ status: 404, description: 'Adresse non trouvée' })
  @ApiResponse({ status: 500, description: 'Erreur serveur inconnue' })

  async remove(@Param('id') addressId: string, @CurrentUser() user: any): Promise<AddressResponseDto> {
    try {
      const userId = user.id;
  
      const result = await this.addressService.remove(addressId, userId);
  
      if (result === null) {
        throw new NotFoundException(`Adresse avec l'id ${addressId} non trouvée`);
      }
  
      if (result === 'OWNER_NOT_FOUND') {
        throw new NotFoundException("Utilisateur propriétaire introuvable.");
      }
  
      if (result === 'FORBIDDEN') {
        throw new ForbiddenException("Vous ne pouvez pas supprimer cette adresse.");
      }
  
      return result;
  
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
  
      throw new InternalServerErrorException('Erreur lors de la suppression de l\'adresse');
    }
  }
  

  @UseGuards(AdminBasicAuthGuard)

  @ApiOperation({ summary: 'Récupérer toutes les adresses (admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200, description: 'Liste paginée des adresses', type: PaginatedAddressResponseDto, example: {
      data: [
        {
          "id": "062408dd-c2e5-4a7a-8a42-056fe1104d28",
          "street": "42 Main Street",
          "city": "paris",
          "postalCode": "10001",
          "country": "USA",
          "userId": "5df8185f-b8fc-46bc-b275-eae4a82a557d",
          "createdAt": "2025-06-26T10:09:56.674Z"
        },
        {
          "id": "6934d9ec-14f3-485d-ac2d-dd62dda82707",
          "street": "42 Main Street",
          "city": "New York",
          "postalCode": "10001",
          "country": "USA",
          "userId": "84e37570-486e-4e84-9873-7409200b5494",
          "createdAt": "2025-06-25T09:37:52.634Z"
        },
      ],
      page: 2,
      totalPages: 5,
      totalItems: 50

    }
  })

  @Get()
  async getAllAddresses(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Res() res: Response,
  ) {
    try {
      let pageNumber = parseInt(page, 10);
      let limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber < 1) {
        pageNumber = 1;
      }
      if (isNaN(limitNumber) || limitNumber < 1) {
        limitNumber = 10;
      }

      const { data, pageCount, resultCount } = await this.addressService.getPaginatedAddresses(
        pageNumber,
        limitNumber,
      );

      res.setHeader('number-of-page', pageNumber.toString());
      res.setHeader('page-count', pageCount.toString());
      res.setHeader('result-count', resultCount.toString());

      return res.status(200).json(data);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la récupération des adresses paginées');
    }
  }



}
