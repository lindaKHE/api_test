export declare class OrderArticleResponseDto {
    id: string;
    quantity: number;
    product: {
        id: number;
        name: string;
        shortText: string;
        unitPrice: number;
        picture?: string;
    };
}
export declare class OrderResponseDto {
    id: string;
    totalHtAmount: number;
    userId: string;
    customerId: string;
    createdAt: Date;
    totalAmount: number;
    totalVatAmount: number;
    status: string;
    customer: {
        firstname: string;
        name: string;
    };
    articles: OrderArticleResponseDto[];
}
