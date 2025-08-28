import { Controller, Get, Post, Body, Query, UseGuards, Patch, Param, Delete, Res, BadRequestException, InternalServerErrorException, NotFoundException, GoneException, ForbiddenException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrderService } from 'src/service/order.service';
import { CreateOrderDto } from 'src/models/dto/create-order.dto';
import { BasicAuthGuard } from 'src/modules/auth/auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Product, User } from '@prisma/client';
import { AdminBasicAuthGuard } from 'src/modules/auth/admin-basic-auth.guard';
import { OrderResponseDto } from 'src/models/dto/order-response.dto';
import { Response } from 'express';
import { isValidOrderStatus } from 'src/common/utils/order-status.util';
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteOrderResponseDto } from 'src/models/dto/delete-order-response.dti';
import { OrderArticleDto } from 'src/models/dto/create-order.dto';
import { PrismaService } from 'src/modules/prisma';
import { FileInterceptor } from '@nestjs/platform-express';
import { justificationMulterOptions } from 'uploads/justifications/justifications-multer.config';


type UserWithProfiles = User & { profiles: { code: string }[] };
type ProductWithAllowedProfiles = Product & {
  allowedProfiles: { code: string }[]
};


@ApiBasicAuth('basic-auth')
@ApiTags('Orders')

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService,  private readonly prisma: PrismaService
  ) { }
  //exemple dans swagger
  @UseGuards(BasicAuthGuard)
  @ApiBody({
    schema: {
      example: {
        articles: [
          {
            productId: 123,
            quantity: 2
          },
          {
            productId: 456,
            quantity: 1
          }
        ]
      }
    }
  })
  private async getCustomer(inputCustomerId: string | null, userId: string): Promise<UserWithProfiles> {
    if (!inputCustomerId) {
      const currentUser = await this.prisma.user.findUnique({ 
        where: { id: userId },
        include: { profiles: true } // ✅ AJOUT ICI
      });
      if (!currentUser) throw new NotFoundException("Utilisateur non trouvé.");
      return currentUser;
    }
  
    const customer = await this.prisma.user.findUnique({
      where: { id: inputCustomerId },
      include: { profiles: true }
    });
  
    if (!customer || customer.parentId !== userId) {
      throw new ForbiddenException("Vous ne pouvez pas passer une commande pour cet utilisateur.");
    }
  
    return customer;
  }
  
  private async getProducts(productIds: number[]): Promise<ProductWithAllowedProfiles[]> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { allowedProfiles: true },
    });
  
    if (products.length !== productIds.length) {
      throw new NotFoundException("Certains produits sont introuvables.");
    }
  
    return products;
  }
  private checkProfiles(customer: UserWithProfiles, products: ProductWithAllowedProfiles[]): void {
    const customerProfiles = customer.profiles.map(p => p.code);
  
    for (const product of products) {
      const allowedCodes = product.allowedProfiles.map(p => p.code);
      if (
        allowedCodes.length > 0 &&
        !allowedCodes.some(code => customerProfiles.includes(code))
      ) {
        throw new ForbiddenException(`Le profil du bénéficiaire ne permet pas de commander le produit ${product.name}.`);
      }
    }
  }
  
  private checkQuantities(articles: OrderArticleDto[], products: Product[]): void {
    for (const article of articles) {
      const product = products.find(p => p.id === Number(article.productId));
      if (!product) continue;
  
      if (
        product.orderMaxQuantity !== null &&
        article.quantity > product.orderMaxQuantity
      ) {
        throw new BadRequestException(`Quantité trop élevée pour le produit ${product.name}. Max autorisé : ${product.orderMaxQuantity}`);
      }
    }
  }
  
  private checkSaleable(products: Product[]): void {
    const nonSaleable = products.find(p => !p.isSaleable);
    if (nonSaleable) {
      throw new BadRequestException(`Le produit ${nonSaleable.name} n'est pas vendable.`);
    }
  }
  

  @ApiOperation({
    summary: 'Créer une commande',
    description: `Cette route permet à un utilisateur de créer une commande.
  
  - Si l'utilisateur est **un parent**, il peut créer une commande :
     - Pour lui-même 
     - Pour un de ses enfants 
  
  - Si l'utilisateur est **un enfant**, il ne peut pas créer de commande
  
  Chaque commande doit contenir au moins un article.`,
  })
  @ApiResponse({
    status: 201, description: 'Commande créée avec succès',
  })
  @ApiResponse({
    status: 400, description: 'Données invalides ou règles métiers non respectées',
  })

    @UseGuards(BasicAuthGuard)
    @Post()
    async createOrder(
      @Body() dto: CreateOrderDto,
      @CurrentUser() user: User,
    ): Promise<OrderResponseDto> {
    
      if (!dto.articles || dto.articles.length === 0) {
        throw new BadRequestException('Une commande doit contenir au moins un article.');
      }
    
      //  le bénéficiaire 
      const customer = await this.getCustomer(dto.customerId, user.id);
    
      //  Récupérer les produits
      const products = await this.getProducts(dto.articles.map(a => Number(a.productId)));
    
      // Vérifier profils autorisés
      this.checkProfiles(customer, products);
    
      // Vérifier les quantités max autorisées
      this.checkQuantities(dto.articles, products);
    
      // Vérifier si tous les produits sont vendables
      this.checkSaleable(products);
    
      // Appel final au service avec le vrai customerId
      return await this.orderService.createOrder(dto, customer.id);
    }
    

  @UseGuards(BasicAuthGuard)
  @ApiOperation({
    summary: 'Lister les commandes',
    description: `Cette route permet de récupérer les commandes :
  
  - Si l'utilisateur est **admin**, il peut voir **toutes les commandes**.
  - Si l'utilisateur est **parent**, il voit uniquement **ses propres commandes** et **celles de ses enfants**.
  
  Les résultats peuvent être filtrés par statut, triés par montant, et paginés.`,
  })
  @ApiQuery({
    name: 'status', required: false, description: 'Filtrer par statut de commande (ex: CREATED, DELIVERED, etc.)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Trier les résultats par montant total de la commande',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numéro de page (pagination)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Nombre de résultats par page (pagination)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des commandes retournée avec succès', type: [OrderResponseDto],

  })
  @Get()
  async getOrders(
    @Query('status') status: string,
    @Query('sort') sort: 'asc' | 'desc',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Res() res: Response,
    @CurrentUser() user: User,
  ): Promise<void> {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);

    try {
      const result = await this.orderService.getOrders(
        user,
        { status, sortByAmount: sort },
        pageNumber,
        limitNumber,
      );

      const { items, total } = result;
      const pageCount = Math.ceil(total / limitNumber);

      res.setHeader('number-of-page', pageNumber.toString());
      res.setHeader('page-count', pageCount.toString());
      res.setHeader('result-count', total.toString());
      res.setHeader('columns', 'customer,totalAmount,status');

      res.status(200).json(items);
    } catch (error) {
      throw new InternalServerErrorException('Impossible de récupérer les commandes.');
    }
  }




  @Patch(':id/status')
  @ApiOperation({ summary: "Mettre à jour le statut d'une commande" })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  @ApiBody({ schema: { example: { status: 'DELIVERED' } } })
  @ApiResponse({ status: 200, description: 'Commande mise à jour', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Statut invalide' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  @UseGuards(AdminBasicAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<OrderResponseDto> {


    if (!isValidOrderStatus(status)) {
      throw new BadRequestException(
        ' Statut invalide. Les valeurs autorisées sont : ${Object.values(OrderStatus).join(', ')'
      );
    }

    const updatedOrder = await this.orderService.updateOrderStatus(id, status);
    if (!updatedOrder) {
      throw new NotFoundException('Commande introuvable.');
    }

    return updatedOrder;
  }


  @UseGuards(AdminBasicAuthGuard)
  @ApiOperation({ summary: 'Supprimer une commande' })
  @ApiParam({
    name: 'id', description: 'ID de la commande à supprimer',
    type: String,
    required: true,
    example: 'order id ',
  })
  @ApiResponse({
    status: 200, description: 'Commande supprimée', type: DeleteOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  @ApiResponse({ status: 410, description: 'Commande déjà supprimée' })
  @Delete(':id')
  async deleteOrder(@Param('id') id: string): Promise<{ message: string; orderId: string }> {
    const result = await this.orderService.deleteOrder(id);

    if (result === 'not_found') {
      throw new NotFoundException('Commande non trouvée');
    }

    if (result === 'already_deleted') {
      throw new GoneException('Commande déjà supprimée');
    }
    return {
      message: 'Commande supprimée avec succès',
      orderId: result.id,
    };
  }
  @Post(':orderId/articles/:orderArticleId/justification')
  @UseInterceptors(FileInterceptor('file', justificationMulterOptions))
  @ApiOperation({ summary: 'Uploader un justificatif pour une ligne de commande' })
  @ApiParam({ name: 'orderId', description: 'ID de la commande' })
  @ApiParam({ name: 'orderArticleId', description: 'ID de la ligne de commande' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadJustification(
    @Param('orderId') orderId: string,
    @Param('orderArticleId') orderArticleId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('Fichier non fourni');
    }

    // Appel du service pour créer l’enregistrement en base
    const justification = await this.orderService.attachJustification({
      orderId,
      orderArticleId,
      file,
    });

    return justification;
  }
}





