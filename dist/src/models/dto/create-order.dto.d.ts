export declare class OrderArticleDto {
    productId: number;
    quantity: number;
}
export declare class CreateOrderDto {
    customerId?: string;
    articles: OrderArticleDto[];
}
