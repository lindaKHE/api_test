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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("../service/product.service");
const create_product_dto_1 = require("../models/dto/create-product.dto");
const auth_guard_1 = require("../modules/auth/auth.guard");
const admin_basic_auth_guard_1 = require("../modules/auth/admin-basic-auth.guard");
const product_response_dto_1 = require("../models/dto/product-response.dto");
const update_product_dto_1 = require("../models/dto/update-product.dto");
const currentUser_decorator_1 = require("../decorators/currentUser.decorator");
const swagger_1 = require("@nestjs/swagger");
const library_1 = require("@prisma/client/runtime/library");
let ProductController = class ProductController {
    constructor(productService) {
        this.productService = productService;
    }
    async create(createProductDto) {
        var _a, _b;
        try {
            const product = await this.productService.create(createProductDto);
            if (!product) {
                throw new common_1.InternalServerErrorException('Création du produit échouée.');
            }
            return product;
        }
        catch (error) {
            if (error.code === 'P2002' &&
                ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('product_name_key'))) {
                throw new common_1.ConflictException("Le nom du produit est déjà utilisé.");
            }
            throw new common_1.InternalServerErrorException('Erreur lors de la création du produit.');
        }
    }
    async getProducts(page = '1', limit = '10', sort, search, res, user) {
        let pageNumber = parseInt(page, 10);
        let limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || pageNumber < 1) {
            pageNumber = 1;
        }
        if (isNaN(limitNumber) || limitNumber < 1) {
            limitNumber = 10;
        }
        const { items, total } = await this.productService.getProducts(user, {
            sort,
            search,
            page: pageNumber,
            limit: limitNumber,
        });
        const pageCount = Math.ceil(total / limitNumber);
        res.setHeader('number-of-page', pageNumber.toString());
        res.setHeader('page-count', pageCount.toString());
        res.setHeader('result-count', total.toString());
        res.setHeader('columns', 'name,price,category');
        return res.status(200).json(items);
    }
    async getAvailableProducts(user, page = '1', limit = '10') {
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
        const result = await this.productService.findSaleableByUserProfiles(user.id, pageNumber, limitNumber);
        if (!result) {
            throw new common_1.NotFoundException('Utilisateur non trouvé ou erreur inconnue.');
        }
        return result;
    }
    async getOneProduct(id) {
        const product = await this.productService.getProductById(id);
        if (!product) {
            throw new common_1.NotFoundException('Produit introuvable');
        }
        return product;
    }
    async updateProduct(productId, updateProductDto) {
        try {
            return await this.productService.update(productId, updateProductDto);
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Produit avec id=${productId} non trouvé`);
            }
            console.error('[UPDATE Produit] Erreur inconnue :', error);
            throw new common_1.InternalServerErrorException('Erreur lors de la mise à jour du produit.');
        }
    }
    async disableProduct(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('ID invalide');
        }
        const product = await this.productService.disableProduct(numericId);
        if (!product) {
            throw new common_1.NotFoundException('Produit non trouvé');
        }
        if (!product.isSaleable) {
            throw new common_1.GoneException('Produit n est plus disponible ');
        }
        return {
            message: 'Produit désactivé avec succès',
            productId: product.id,
        };
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard, admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un ticket de transport' }),
    (0, swagger_1.ApiBody)({ type: create_product_dto_1.CreateProductDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket créé avec succès', type: product_response_dto_1.ProductResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard, admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer la liste paginée des produits (admin uniquement)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1, description: 'Numéro de page (défaut: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10, description: 'Nombre d’éléments par page (défaut: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (asc ou desc)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Recherche par nom de produit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste paginée des produits', type: [product_response_dto_1.ProductResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Authentification requise' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Accès interdit (non admin)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('sort')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Res)()),
    __param(5, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProducts", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)('available'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les produits disponibles à la vente' }),
    (0, swagger_1.ApiQuery)({ name: 'allowedProfileCode', required: false, example: 'ETUDIANT', description: 'Filtrer par profil autorisé' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1, description: 'Numéro de page (défaut: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10, description: 'Nombre d’éléments par page (défaut: 10)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des produits vendables', type: [product_response_dto_1.ProductResponseDto] }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Authentification requise' }),
    __param(0, (0, currentUser_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAvailableProducts", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un ticket par son ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du ticket' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket trouvé', type: product_response_dto_1.ProductResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getOneProduct", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard, admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du ticket à mettre à jour' }),
    (0, swagger_1.ApiBody)({ type: update_product_dto_1.UpdateProductDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket mis à jour', type: product_response_dto_1.ProductResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard, admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du ticket à supprimer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket supprimé', type: product_response_dto_1.ProductResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "disableProduct", null);
exports.ProductController = ProductController = __decorate([
    (0, swagger_1.ApiBasicAuth)('basic-auth'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map