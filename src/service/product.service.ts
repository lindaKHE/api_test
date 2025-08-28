import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma';
import { CreateProductDto } from 'src/models/dto/create-product.dto';
import { UpdateProductDto } from 'src/models/dto/update-product.dto';
import { Product, User } from '@prisma/client';
import { ProductResponseDto } from 'src/models/dto/product-response.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        shortText: dto.shortText,
        unitPrice: dto.unitPrice,
        isSaleable: dto.isSaleable,
        picture: dto.picture,
        orderMaxQuantity: dto.orderMaxQuantity,
        vatRate: dto.vatRate ?? 0,
        allowedProfiles: dto.allowedProfileCodes
          ? {
            connect: dto.allowedProfileCodes.map(code => ({ code })),
          }
          : undefined,
      },
      include: {
        allowedProfiles: true,
      },
    });
    return product || null;


  }

  async getProducts(
    user: User,
    options: {
      sort?: 'asc' | 'desc';
      search?: string;
      page: number;
      limit: number;
    },
  ): Promise<{ items: ProductResponseDto[]; total: number }> {
    const { sort, search, page, limit } = options;

    const whereClause = {
      name: search ? { contains: search, mode: 'insensitive' } : undefined,
    };

    const items = await this.prisma.product.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.product.count({ where: whereClause });

    return { items, total };
  }


  async getProductById(id: string): Promise<ProductResponseDto | null> {
    const product = await this.prisma.product.findUnique({ where: { id: Number(id) } });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      shortText: product.shortText,
      unitPrice: product.unitPrice,
      picture: product.picture,
      isSaleable: product.isSaleable,
      orderMaxQuantity: product.orderMaxQuantity,
      vatRate: product.vatRate,

    };
  }


  async findAll({ isSaleable, allowedProfileCode, page = 1, limit = 10 }) {
    const filters: any = {};

    if (isSaleable !== undefined) {
      filters.isSaleable = isSaleable === 'true';
    }

    if (allowedProfileCode) {
      filters.allowedProfiles = {
        some: {
          code: allowedProfileCode,
        },
      };
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: filters,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          allowedProfiles: true,
        },
      }),
      this.prisma.product.count({ where: filters }),
    ]);

    return { items, total };
  }


  async findById(id: number): Promise<ProductResponseDto | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findSaleableByUserProfiles(userId: string, page = 1, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });

    if (!user) return null;

    const profileCodes = user.profiles.map(p => p.code);

    return this.prisma.product.findMany({
      where: {
        isSaleable: true,
        allowedProfiles: {
          some: {
            code: { in: profileCodes },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      include: { allowedProfiles: true },
    });
  }



  async update(id: number, data: UpdateProductDto): Promise<ProductResponseDto> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }




  async disableProduct(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      return null;
    }

    if (!product.isSaleable) {
      return product;
    }

    return this.prisma.product.update({
      where: { id },
      data: { isSaleable: false },
    });
  }

}