import { PrismaService } from 'src/modules/prisma';
import { CreateProductDto } from 'src/models/dto/create-product.dto';
import { UpdateProductDto } from 'src/models/dto/update-product.dto';
import { Product, User } from '@prisma/client';
import { ProductResponseDto } from 'src/models/dto/product-response.dto';
export declare class ProductService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProductDto): Promise<ProductResponseDto>;
    getProducts(user: User, options: {
        sort?: 'asc' | 'desc';
        search?: string;
        page: number;
        limit: number;
    }): Promise<{
        items: ProductResponseDto[];
        total: number;
    }>;
    getProductById(id: string): Promise<ProductResponseDto | null>;
    findAll({ isSaleable, allowedProfileCode, page, limit }: {
        isSaleable: any;
        allowedProfileCode: any;
        page?: number;
        limit?: number;
    }): Promise<{
        items: ({
            allowedProfiles: {
                id: string;
                code: string;
                label: string;
            }[];
        } & {
            id: number;
            name: string;
            shortText: string;
            unitPrice: number;
            isSaleable: boolean;
            picture: string | null;
            orderMaxQuantity: number | null;
            vatRate: number;
        })[];
        total: number;
    }>;
    findById(id: number): Promise<ProductResponseDto | null>;
    findSaleableByUserProfiles(userId: string, page?: number, limit?: number): Promise<({
        allowedProfiles: {
            id: string;
            code: string;
            label: string;
        }[];
    } & {
        id: number;
        name: string;
        shortText: string;
        unitPrice: number;
        isSaleable: boolean;
        picture: string | null;
        orderMaxQuantity: number | null;
        vatRate: number;
    })[]>;
    update(id: number, data: UpdateProductDto): Promise<ProductResponseDto>;
    disableProduct(id: number): Promise<Product | null>;
}
