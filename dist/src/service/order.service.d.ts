import { PrismaService } from 'src/modules/prisma';
import { CreateOrderDto } from 'src/models/dto/create-order.dto';
import { JustificationStatus, Order, User } from '@prisma/client';
import { OrderResponseDto } from 'src/models/dto/order-response.dto';
export declare class OrderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto | null>;
    getOrders(user: User, filters?: {
        status?: string;
        sortByAmount?: 'asc' | 'desc';
    }, page?: number, limit?: number): Promise<{
        items: OrderResponseDto[];
        total: number;
    }>;
    updateOrderStatus(orderId: string, status: string): Promise<OrderResponseDto | null>;
    findAll(): Promise<Order[]>;
    deleteOrder(id: string): Promise<'not_found' | 'already_deleted' | Order>;
    attachJustification(params: {
        orderId: string;
        orderArticleId: string;
        file: Express.Multer.File;
    }): Promise<{
        id: number;
        orderArticleId: string;
        path: string;
        originalName: string;
        mimeType: string;
        size: number;
        status: import(".prisma/client").$Enums.JustificationStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getJustificationById(id: number): Promise<{
        id: number;
        orderArticleId: string;
        path: string;
        originalName: string;
        mimeType: string;
        size: number;
        status: import(".prisma/client").$Enums.JustificationStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllJustifications(status?: JustificationStatus): Promise<({
        orderArticle: {
            id: string;
            orderId: string;
            productId: number;
            quantity: number;
            unitPrice: number;
        };
    } & {
        id: number;
        orderArticleId: string;
        path: string;
        originalName: string;
        mimeType: string;
        size: number;
        status: import(".prisma/client").$Enums.JustificationStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateJustificationStatus(id: number, status: JustificationStatus): Promise<{
        id: number;
        orderArticleId: string;
        path: string;
        originalName: string;
        mimeType: string;
        size: number;
        status: import(".prisma/client").$Enums.JustificationStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
