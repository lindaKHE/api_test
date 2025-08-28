import { ProductService } from 'src/service/product.service';
import { CreateProductDto } from 'src/models/dto/create-product.dto';
import { ProductResponseDto } from 'src/models/dto/product-response.dto';
import { UpdateProductDto } from 'src/models/dto/update-product.dto';
import { Response } from 'express';
import { User } from '@prisma/client';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createProductDto: CreateProductDto): Promise<ProductResponseDto>;
    getProducts(page: string, limit: string, sort: 'asc' | 'desc', search: string, res: Response, user: User): Promise<Response<any, Record<string, any>>>;
    getAvailableProducts(user: User, page?: string, limit?: string): Promise<ProductResponseDto[]>;
    getOneProduct(id: string): Promise<ProductResponseDto>;
    updateProduct(productId: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto>;
    disableProduct(id: string): Promise<{
        message: string;
        productId: number;
    }>;
}
