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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("../service/order.service");
const create_order_dto_1 = require("../models/dto/create-order.dto");
const auth_guard_1 = require("../modules/auth/auth.guard");
const currentUser_decorator_1 = require("../decorators/currentUser.decorator");
const client_1 = require("@prisma/client");
const admin_basic_auth_guard_1 = require("../modules/auth/admin-basic-auth.guard");
const order_response_dto_1 = require("../models/dto/order-response.dto");
const order_status_util_1 = require("../common/utils/order-status.util");
const swagger_1 = require("@nestjs/swagger");
const delete_order_response_dti_1 = require("../models/dto/delete-order-response.dti");
const prisma_1 = require("../modules/prisma");
const platform_express_1 = require("@nestjs/platform-express");
const justifications_multer_config_1 = require("../../uploads/justifications/justifications-multer.config");
let OrderController = class OrderController {
    constructor(orderService, prisma) {
        this.orderService = orderService;
        this.prisma = prisma;
    }
    async getCustomer(inputCustomerId, userId) {
        if (!inputCustomerId) {
            const currentUser = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { profiles: true }
            });
            if (!currentUser)
                throw new common_1.NotFoundException("Utilisateur non trouvé.");
            return currentUser;
        }
        const customer = await this.prisma.user.findUnique({
            where: { id: inputCustomerId },
            include: { profiles: true }
        });
        if (!customer || customer.parentId !== userId) {
            throw new common_1.ForbiddenException("Vous ne pouvez pas passer une commande pour cet utilisateur.");
        }
        return customer;
    }
    async getProducts(productIds) {
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { allowedProfiles: true },
        });
        if (products.length !== productIds.length) {
            throw new common_1.NotFoundException("Certains produits sont introuvables.");
        }
        return products;
    }
    checkProfiles(customer, products) {
        const customerProfiles = customer.profiles.map(p => p.code);
        for (const product of products) {
            const allowedCodes = product.allowedProfiles.map(p => p.code);
            if (allowedCodes.length > 0 &&
                !allowedCodes.some(code => customerProfiles.includes(code))) {
                throw new common_1.ForbiddenException(`Le profil du bénéficiaire ne permet pas de commander le produit ${product.name}.`);
            }
        }
    }
    checkQuantities(articles, products) {
        for (const article of articles) {
            const product = products.find(p => p.id === Number(article.productId));
            if (!product)
                continue;
            if (product.orderMaxQuantity !== null &&
                article.quantity > product.orderMaxQuantity) {
                throw new common_1.BadRequestException(`Quantité trop élevée pour le produit ${product.name}. Max autorisé : ${product.orderMaxQuantity}`);
            }
        }
    }
    checkSaleable(products) {
        const nonSaleable = products.find(p => !p.isSaleable);
        if (nonSaleable) {
            throw new common_1.BadRequestException(`Le produit ${nonSaleable.name} n'est pas vendable.`);
        }
    }
    async createOrder(dto, user) {
        if (!dto.articles || dto.articles.length === 0) {
            throw new common_1.BadRequestException('Une commande doit contenir au moins un article.');
        }
        const customer = await this.getCustomer(dto.customerId, user.id);
        const products = await this.getProducts(dto.articles.map(a => Number(a.productId)));
        this.checkProfiles(customer, products);
        this.checkQuantities(dto.articles, products);
        this.checkSaleable(products);
        return await this.orderService.createOrder(dto, customer.id);
    }
    async getOrders(status, sort, page = '1', limit = '10', res, user) {
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
        try {
            const result = await this.orderService.getOrders(user, { status, sortByAmount: sort }, pageNumber, limitNumber);
            const { items, total } = result;
            const pageCount = Math.ceil(total / limitNumber);
            res.setHeader('number-of-page', pageNumber.toString());
            res.setHeader('page-count', pageCount.toString());
            res.setHeader('result-count', total.toString());
            res.setHeader('columns', 'customer,totalAmount,status');
            res.status(200).json(items);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Impossible de récupérer les commandes.');
        }
    }
    async updateStatus(id, status) {
        if (!(0, order_status_util_1.isValidOrderStatus)(status)) {
            throw new common_1.BadRequestException(' Statut invalide. Les valeurs autorisées sont : ${Object.values(OrderStatus).join(', ')');
        }
        const updatedOrder = await this.orderService.updateOrderStatus(id, status);
        if (!updatedOrder) {
            throw new common_1.NotFoundException('Commande introuvable.');
        }
        return updatedOrder;
    }
    async deleteOrder(id) {
        const result = await this.orderService.deleteOrder(id);
        if (result === 'not_found') {
            throw new common_1.NotFoundException('Commande non trouvée');
        }
        if (result === 'already_deleted') {
            throw new common_1.GoneException('Commande déjà supprimée');
        }
        return {
            message: 'Commande supprimée avec succès',
            orderId: result.id,
        };
    }
    async uploadJustification(orderId, orderArticleId, file) {
        if (!file) {
            throw new common_1.NotFoundException('Fichier non fourni');
        }
        const justification = await this.orderService.attachJustification({
            orderId,
            orderArticleId,
            file,
        });
        return justification;
    }
    async getJustification(id) {
        const justification = await this.orderService.getJustificationById(id);
        if (!justification) {
            throw new common_1.NotFoundException(`Justificatif ${id} introuvable`);
        }
        return justification;
    }
    async getAllJustifications(status) {
        let enumStatus;
        if (status) {
            if (!Object.values(client_1.JustificationStatus).includes(status)) {
                throw new common_1.BadRequestException(`Statut invalide : ${status}`);
            }
            enumStatus = status;
        }
        const justifications = await this.orderService.getAllJustifications(enumStatus);
        if (!justifications || justifications.length === 0) {
            throw new common_1.NotFoundException('Aucun justificatif trouvé');
        }
        return justifications;
    }
    async updateJustificationStatus(id, status) {
        if (!Object.values(client_1.JustificationStatus).includes(status)) {
            throw new common_1.BadRequestException(`Statut invalide : ${status}`);
        }
        const updated = await this.orderService.updateJustificationStatus(id, status);
        if (!updated) {
            throw new common_1.NotFoundException(`Justificatif ${id} introuvable`);
        }
        return updated;
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                articles: [
                    {
                        productId: 123,
                        quantity: 2
                    },
                    {
                        productId: 456,
                        quantity: 1
                    }
                ]
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getCustomer", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une commande',
        description: `Cette route permet à un utilisateur de créer une commande.
  
  - Si l'utilisateur est **un parent**, il peut créer une commande :
     - Pour lui-même 
     - Pour un de ses enfants 
  
  - Si l'utilisateur est **un enfant**, il ne peut pas créer de commande
  
  Chaque commande doit contenir au moins un article.`,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201, description: 'Commande créée avec succès',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400, description: 'Données invalides ou règles métiers non respectées',
    }),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les commandes',
        description: `Cette route permet de récupérer les commandes :
  
  - Si l'utilisateur est **admin**, il peut voir **toutes les commandes**.
  - Si l'utilisateur est **parent**, il voit uniquement **ses propres commandes** et **celles de ses enfants**.
  
  Les résultats peuvent être filtrés par statut, triés par montant, et paginés.`,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status', required: false, description: 'Filtrer par statut de commande (ex: CREATED, DELIVERED, etc.)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Trier les résultats par montant total de la commande',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Numéro de page (pagination)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Nombre de résultats par page (pagination)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste des commandes retournée avec succès', type: [order_response_dto_1.OrderResponseDto],
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('sort')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Res)()),
    __param(5, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour le statut d'une commande" }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la commande' }),
    (0, swagger_1.ApiBody)({ schema: { example: { status: 'DELIVERED' } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Commande mise à jour', type: order_response_dto_1.OrderResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Statut invalide' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Commande introuvable' }),
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une commande' }),
    (0, swagger_1.ApiParam)({
        name: 'id', description: 'ID de la commande à supprimer',
        type: String,
        required: true,
        example: 'order id ',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200, description: 'Commande supprimée', type: delete_order_response_dti_1.DeleteOrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Commande non trouvée' }),
    (0, swagger_1.ApiResponse)({ status: 410, description: 'Commande déjà supprimée' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.Post)(':orderId/articles/:orderArticleId/justification'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', justifications_multer_config_1.justificationMulterOptions)),
    (0, swagger_1.ApiOperation)({ summary: 'Uploader un justificatif pour une  de commande' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', description: 'ID de la commande' }),
    (0, swagger_1.ApiParam)({ name: 'orderArticleId', description: 'ID  de la  commande' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('orderArticleId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "uploadJustification", null);
__decorate([
    (0, common_1.Get)('justifications/:id'),
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un justificatif par son ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du justificatif' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getJustification", null);
__decorate([
    (0, common_1.Get)('justifications'),
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les justificatifs (optionnel : filtrer par statut)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filtrer par statut : A_VALIDER, VALIDE, REFUSE' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getAllJustifications", null);
__decorate([
    (0, common_1.Patch)('justifications/:id/status'),
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier le statut d’un justificatif' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du justificatif' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['A_VALIDER', 'VALIDE', 'REFUSE']
                },
            },
            required: ['status'],
        },
    }),
    (0, common_1.Patch)('justifications/:id/status'),
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier le statut d’un justificatif' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID du justificatif' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['A_VALIDER', 'VALIDE', 'REFUSE'] },
            },
            required: ['status'],
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateJustificationStatus", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiBasicAuth)('basic-auth'),
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService, prisma_1.PrismaService])
], OrderController);
//# sourceMappingURL=order.controller.js.map