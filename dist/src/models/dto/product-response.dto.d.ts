export declare class ProductResponseDto {
    id: number;
    name: string;
    shortText: string;
    unitPrice: number;
    isSaleable: boolean;
    picture?: string;
    orderMaxQuantity?: number;
    vatRate: number;
    allowedProfiles?: {
        id: string;
        code: string;
        label: string;
    }[];
}
