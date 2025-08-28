"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderResponseDto = exports.OrderArticleResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class OrderArticleResponseDto {
}
exports.OrderArticleResponseDto = OrderArticleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-article-123' }),
    __metadata("design:type", String)
], OrderArticleResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OrderArticleResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informations sur le produit',
        example: {
            id: 123,
            name: 'Produit XYZ',
            shortText: 'Description courte du produit',
            unitPrice: 99.99,
            picture: 'https://example.com/image.jpg',
        },
    }),
    __metadata("design:type", Object)
], OrderArticleResponseDto.prototype, "product", void 0);
class OrderResponseDto {
}
exports.OrderResponseDto = OrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-order-123' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120.60 }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "totalHtAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-user-456' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-customer-789' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-07-18T12:34:56.789Z' }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.75 }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30.15 }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "totalVatAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DELIVERED' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informations sur le client',
        example: {
            firstname: 'Jean',
            name: 'Dupont',
        },
    }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderArticleResponseDto] }),
    __metadata("design:type", Array)
], OrderResponseDto.prototype, "articles", void 0);
//# sourceMappingURL=order-response.dto.js.map