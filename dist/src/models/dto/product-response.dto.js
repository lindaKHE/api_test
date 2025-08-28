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
exports.ProductResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ProductResponseDto {
}
exports.ProductResponseDto = ProductResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Identifiant unique du produit' }),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ticket de métro Paris', description: 'Nom du produit' }),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Accès illimité au métro et bus zones 1-2 pendant 1 jour',
        description: 'Description courte du produit',
    }),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "shortText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7.5, description: 'Prix unitaire en euros' }),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Le produit est-il vendable ?' }),
    __metadata("design:type", Boolean)
], ProductResponseDto.prototype, "isSaleable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://tickets.sncf.fr/images/paris-ticket.jpg',
        required: false,
        description: 'URL de l’image du produit',
    }),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "picture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        required: false,
        description: 'Quantité maximale commandable',
    }),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "orderMaxQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Taux de TVA appliqué',
    }),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "vatRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'array',
        required: false,
        description: 'Liste des profils autorisés',
        example: [
            { id: '1', code: 'ETUDIANT', label: 'Étudiant' },
            { id: '2', code: 'PMR', label: 'Personne à mobilité réduite' },
        ],
    }),
    __metadata("design:type", Array)
], ProductResponseDto.prototype, "allowedProfiles", void 0);
//# sourceMappingURL=product-response.dto.js.map