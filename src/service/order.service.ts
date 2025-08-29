import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma';
import { CreateOrderDto } from 'src/models/dto/create-order.dto';
import { JustificationStatus, Order, User } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import { OrderResponseDto } from 'src/models/dto/order-response.dto';
import { isValidOrderStatus } from 'src/common/utils/order-status.util';
import { JustificationStatusTs } from 'src/enums/src/enums/justification-status.enum';


@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) { }
  async createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto | null> {

    const { customerId: inputCustomerId, articles } = createOrderDto;

    if (!articles || articles.length === 0) {
      return null;
    }

    const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return null;
    }

    let customerId = inputCustomerId;

    if (!customerId) {
      // Commander pour soi-même
      if (currentUser.parentId !== null) {
        return null;
      }
      customerId = userId;
    } else {
      // Commander pour un enfant
      const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
      if (!customer || customer.parentId !== userId) {
        return null;
      }
    }

    const productIds = articles.map(a => Number(a.productId));
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        shortText: true,
        unitPrice: true,
        isSaleable: true,
        picture: true,
        orderMaxQuantity: true,
        vatRate: true,
        allowedProfiles: {
          select: {
            code: true,
          },
        },
      },
    });


    const client = await this.prisma.user.findUnique({
      where: { id: customerId },
      include: { profiles: true },
    });

    if (!client) {
      return null;
    }

    const clientProfileCodes = client.profiles.map(p => p.code);

    // Vérification des profils autorisés pour chaque produit
    for (const product of products) {
      const allowedCodes = product.allowedProfiles.map(p => p.code);

      if (
        allowedCodes.length > 0 &&
        !allowedCodes.some(code => clientProfileCodes.includes(code))
      ) {
        return null; 
      }

    }




    const nonSaleableProduct = products.find(p => !p.isSaleable);
    if (nonSaleableProduct) {
      return null;
    }

    let totalHtAmount = 0;
    let totalVatAmount = 0;

    const orderArticles = articles.map(article => {
      const product = products.find(p => p.id === Number(article.productId));
      if (!product)
        return null;

      if (
        product.orderMaxQuantity !== null &&
        product.orderMaxQuantity !== undefined &&
        article.quantity > product.orderMaxQuantity
      ) {
        return null;
      }


      const quantity = article.quantity;
      const unitPriceTTC = product.unitPrice;
      const vatRate = product.vatRate || 0;

      const lineTotalTTC = unitPriceTTC * quantity;
      const lineTotalVAT = lineTotalTTC * (vatRate / (100 + vatRate));
      const lineTotalHT = lineTotalTTC - lineTotalVAT;

      totalHtAmount += lineTotalHT;
      totalVatAmount += lineTotalVAT;

      return {
        productId: product.id,
        quantity,
        unitPrice: product.unitPrice,
      };
    })

    if (orderArticles.includes(null)) {
      return null;
    }

    const totalAmount = totalHtAmount + totalVatAmount;

    const order = await this.prisma.order.create({
      data: {
        userId,
        customerId,
        totalAmount,
        totalVatAmount,
        totalHtAmount,
        articles: {
          create: orderArticles as any[],
        },
      },
      include: {
        customer: {
          select: {
            firstname: true,
            name: true,
          },
        },
        articles: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                shortText: true,
                unitPrice: true,
                picture: true,
              },
            },
          },
        },
      },
    });
    const cleanedArticles = order.articles.map(article => {
      const { unitPrice, ...rest } = article;
      return rest;
    });

    return {
      ...order,
      articles: cleanedArticles,
    };
  }






  async getOrders(
    user: User,
    filters?: { status?: string; sortByAmount?: 'asc' | 'desc' },
    page = 1,
    limit = 10,
  ): Promise<{ items: OrderResponseDto[]; total: number }> {
    const where: any = {};

    if (user.isAdmin) {
      if (filters?.status) {
        where.status = filters.status;
      }
    } else {
      const children = await this.prisma.user.findMany({
        where: { parentId: user.id },
        select: { id: true },
      });

      const childIds = children.map(c => c.id);
      where.customerId = { in: [user.id, ...childIds] };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            firstname: true,
            name: true,
          },
        },
        articles: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                shortText: true,
                unitPrice: true,
                vatRate: true,
                picture: true,
              },
            },
          },
        },
      },
      orderBy: filters?.sortByAmount
        ? { totalAmount: filters.sortByAmount }
        : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.order.count({ where });

    const ordersWithTotals = orders.map(order => {
      const totalHtAmount = order.articles.reduce((sum, article) => {
        return sum + article.unitPrice * article.quantity;
      }, 0);

      const totalVatAmount = order.articles.reduce((sum, article) => {
        const vatRate = article.product?.vatRate ?? 0;
        const lineHt = article.unitPrice * article.quantity;
        const lineVat = Math.round((lineHt * vatRate) / 100);
        return sum + lineVat;
      }, 0);

      return {
        ...order,
        totalAmount: totalHtAmount,
        totalVatAmount,
        totalAmountTTC: totalHtAmount + totalVatAmount,
      };
    });
    //changer le retour (dto )
    return { items: ordersWithTotals, total };
  }






  async updateOrderStatus(orderId: string, status: string): Promise<OrderResponseDto | null> {

    if (!isValidOrderStatus(status)) {
      return null; // statut invalide
    }


    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return null; // commande non trouvée
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        customer: {
          select: {
            firstname: true,
            name: true,
          },
        },
        articles: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                shortText: true,
                unitPrice: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }



  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { isDeleted: false },
      include: { articles: true },
    });
  }


  //$
  async deleteOrder(id: string): Promise<'not_found' | 'already_deleted' | Order> {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      return 'not_found';
    }

    if (order.isDeleted) {
      return 'already_deleted';
    }
    return this.prisma.order.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  
  
  
 
  async attachJustification(params: {
    orderId: string;
    orderArticleId: string;
    file: Express.Multer.File;
  }) {
    const { orderId, orderArticleId, file } = params;

    // 1) Vérifier que la commande existe
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException(`Commande ${orderId} introuvable`);

    // 2) Vérifier que la ligne de commande existe et appartient bien à cette commande
    const orderArticle = await this.prisma.orderArticle.findUnique({
      where: { id: orderArticleId },
    });
    if (!orderArticle || orderArticle.orderId !== orderId) {
      throw new NotFoundException(
        `Ligne de commande ${orderArticleId} introuvable pour la commande ${orderId}`,
      );
    }

    // 3) Créer l'entrée en base pour le fichier justificatif
    const justification = await this.prisma.justificationDocument.create({
      data: {
        orderArticleId: orderArticleId,
        path: file.path,                  // chemin du fichier côté serveur
        originalName: file.originalname,  // nom original du fichier
        mimeType: file.mimetype,          // pdf, png...(autoriser que pdf,png )//
        size: file.size,                  // taille du fichier
        status: JustificationStatusTs.A_VALIDER, // statut par deafaut 
      },
    });

    return justification;
  }


  async getJustificationById(id: number) {
    return this.prisma.justificationDocument.findUnique({
      where: { id },
    });
  }

 
async getAllJustifications(status?: JustificationStatus) {
  return this.prisma.justificationDocument.findMany({
    where: status ? { status } : {},
    include: { orderArticle: true },
    orderBy: { createdAt: 'desc' },
  });
  }
  
  
  async updateJustificationStatus(
    id: number,
    status: JustificationStatus,
  ) {
    const justification = await this.prisma.justificationDocument.findUnique({
      where: { id },
      include: {
        orderArticle: {
          include: {
            order: { include: { user: true } },
            product: { include: { allowedProfiles: true } },
          },
        },
      },
    });
  
    if (!justification) return null;
  
    // Mettre à jour le statut du justificatif
    const updated = await this.prisma.justificationDocument.update({
      where: { id },
      data: { status },
    });
  
    // Si VALIDE, ajouter les profils autorisés du produit à l'utilisateur
    if (status === JustificationStatus.VALIDE) {
      const userId = justification.orderArticle.order.user.id;
      const allowedProfiles = justification.orderArticle.product.allowedProfiles;
  
      if (allowedProfiles.length > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            profiles: {
              connect: allowedProfiles.map((p) => ({ id: p.id })),
            },
          },
        });
      }
    }
  
    return updated;
  }
  
  
  
}
  










