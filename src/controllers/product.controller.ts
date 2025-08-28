import { Controller, Get, Post, Body, Query, UseGuards, Patch, Param, Delete, Res, NotFoundException, ConflictException, InternalServerErrorException, GoneException, BadRequestException } from '@nestjs/common';
import { ProductService } from 'src/service/product.service';
import { CreateProductDto } from 'src/models/dto/create-product.dto';
import { BasicAuthGuard } from 'src/modules/auth/auth.guard';
import { AdminBasicAuthGuard } from 'src/modules/auth/admin-basic-auth.guard';
import { ProductResponseDto } from 'src/models/dto/product-response.dto';
import { UpdateProductDto } from 'src/models/dto/update-product.dto';
import { Response } from 'express';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { ApiBasicAuth, ApiBody, ApiForbiddenResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@ApiBasicAuth('basic-auth')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }




  @Post()
  @UseGuards(BasicAuthGuard, AdminBasicAuthGuard)
  @ApiOperation({ summary: 'Créer un ticket de transport' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Ticket créé avec succès', type: ProductResponseDto })
  async create(
    @Body() createProductDto: CreateProductDto
  ): Promise<ProductResponseDto> {
    try {
      const product = await this.productService.create(createProductDto);

      if (!product) {
        throw new InternalServerErrorException('Création du produit échouée.');
      }

      return product;
    } catch (error: any) {
      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('product_name_key')
      ) {
        throw new ConflictException("Le nom du produit est déjà utilisé.");
      }

      throw new InternalServerErrorException('Erreur lors de la création du produit.');
    }
  }



  @UseGuards(BasicAuthGuard, AdminBasicAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Récupérer la liste paginée des produits (admin uniquement)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Nombre d’éléments par page (défaut: 10)' })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (asc ou desc)' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom de produit' })
  @ApiResponse({ status: 200, description: 'Liste paginée des produits', type: [ProductResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Authentification requise' })
  @ApiForbiddenResponse({ description: 'Accès interdit (non admin)' })

  async getProducts(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sort') sort: 'asc' | 'desc',
    @Query('search') search: string,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      pageNumber = 1;
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      limitNumber = 10;
    }

    const { items, total } = await this.productService.getProducts(user, {
      sort,
      search,
      page: pageNumber,
      limit: limitNumber,
    });

    const pageCount = Math.ceil(total / limitNumber);

    res.setHeader('number-of-page', pageNumber.toString());
    res.setHeader('page-count', pageCount.toString());
    res.setHeader('result-count', total.toString());
    res.setHeader('columns', 'name,price,category');

    return res.status(200).json(items);
  }




  @UseGuards(BasicAuthGuard)
  @Get('available')
  @ApiOperation({ summary: 'Récupérer les produits disponibles à la vente' })
  @ApiQuery({ name: 'allowedProfileCode', required: false, example: 'ETUDIANT', description: 'Filtrer par profil autorisé' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Nombre d’éléments par page (défaut: 10)' })
  @ApiResponse({ status: 200, description: 'Liste des produits vendables', type: [ProductResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Authentification requise' })
  async getAvailableProducts(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<ProductResponseDto[]> {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);

    const result = await this.productService.findSaleableByUserProfiles(user.id, pageNumber, limitNumber);

    if (!result) {
      throw new NotFoundException('Utilisateur non trouvé ou erreur inconnue.');
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un ticket par son ID' })
  @ApiParam({ name: 'id', description: 'ID du ticket' })
  @ApiResponse({ status: 200, description: 'Ticket trouvé', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket non trouvé' })
  async getOneProduct(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productService.getProductById(id);

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    return product;
  }

  @Patch(':id')
  @UseGuards(BasicAuthGuard, AdminBasicAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un ticket' })
  @ApiParam({ name: 'id', description: 'ID du ticket à mettre à jour' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Ticket mis à jour', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket non trouvé' })
  async updateProduct(
    @Param('id') productId: number,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    try {
      return await this.productService.update(productId, updateProductDto);
    } catch (error) {

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Produit avec id=${productId} non trouvé`);
      }

      console.error('[UPDATE Produit] Erreur inconnue :', error);
      throw new InternalServerErrorException('Erreur lors de la mise à jour du produit.');
    }
  }


  @Delete(':id')
  @UseGuards(BasicAuthGuard, AdminBasicAuthGuard)
  @ApiOperation({ summary: 'Supprimer un ticket' })
  @ApiParam({ name: 'id', description: 'ID du ticket à supprimer' })
  @ApiResponse({ status: 200, description: 'Ticket supprimé', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket non trouvé' })
  async disableProduct(@Param('id') id: string): Promise<{ message: string; productId: number }> {
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      throw new BadRequestException('ID invalide');
    }

    const product = await this.productService.disableProduct(numericId);

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (!product.isSaleable) {
      throw new GoneException('Produit n est plus disponible ');
    }

    return {
      message: 'Produit désactivé avec succès',
      productId: product.id,
    };
  }
}





