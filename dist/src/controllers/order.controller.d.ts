import { OrderService } from 'src/service/order.service';
import { CreateOrderDto } from 'src/models/dto/create-order.dto';
import { User } from '@prisma/client';
import { OrderResponseDto } from 'src/models/dto/order-response.dto';
import { Response } from 'express';
import { PrismaService } from 'src/modules/prisma';
export declare class OrderController {
    private readonly orderService;
    private readonly prisma;
    constructor(orderService: OrderService, prisma: PrismaService);
    private getCustomer;
    private getProducts;
    private checkProfiles;
    private checkQuantities;
    private checkSaleable;
    createOrder(dto: CreateOrderDto, user: User): Promise<OrderResponseDto>;
    getOrders(status: string, sort: 'asc' | 'desc', page: string, limit: string, res: Response, user: User): Promise<void>;
    updateStatus(id: string, status: string): Promise<OrderResponseDto>;
    deleteOrder(id: string): Promise<{
        message: string;
        orderId: string;
    }>;
    uploadJustification(orderId: string, orderArticleId: string, file: Express.Multer.File): Promise<{
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
