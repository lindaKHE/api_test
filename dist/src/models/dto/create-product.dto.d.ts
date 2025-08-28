export declare class CreateProductDto {
    name: string;
    shortText: string;
    unitPrice: number;
    isSaleable: boolean;
    picture?: string;
    orderMaxQuantity?: number;
    allowedProfileCodes?: string[];
    vatRate: number;
}
