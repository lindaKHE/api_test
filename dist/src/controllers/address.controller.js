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
exports.AddressController = void 0;
const common_1 = require("@nestjs/common");
const address_service_1 = require("../service/address.service");
const create_address_dto_1 = require("../models/dto/create-address.dto");
const update_address_dto_1 = require("../models/dto/update-address.dto");
const auth_guard_1 = require("../modules/auth/auth.guard");
const address_response_dto_1 = require("../models/dto/address-response.dto");
const user_service_1 = require("../service/user.service");
const currentUser_decorator_1 = require("../decorators/currentUser.decorator");
const prisma_1 = require("../modules/prisma");
const admin_basic_auth_guard_1 = require("../modules/auth/admin-basic-auth.guard");
const library_1 = require("@prisma/client/runtime/library");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
const paginated_address_response_dto_1 = require("../models/paginated-address-response.dto");
let AddressController = class AddressController {
    constructor(addressService, userService, prisma) {
        this.addressService = addressService;
        this.userService = userService;
        this.prisma = prisma;
    }
    async createAddressForSelf(createAddressDto, currentUser) {
        try {
            createAddressDto.userId = currentUser.id;
            return await this.addressService.createForUser(createAddressDto);
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw new common_1.ForbiddenException(error.message);
            }
            throw new common_1.InternalServerErrorException('Erreur lors de la création de l\'adresse');
        }
    }
    async getAddressById(addressId, currentUser) {
        const address = await this.addressService.getById(addressId);
        if (!address) {
            throw new common_1.NotFoundException('Adresse non trouvée');
        }
        if (address.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Accès interdit à cette adresse');
        }
        return address;
    }
    async createAddressForChild(userId, createAddressDto, currentUser) {
        const child = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!child) {
            throw new common_1.NotFoundException('Enfant non trouvé');
        }
        if (child.parentId !== currentUser.id) {
            throw new common_1.ForbiddenException('Pas autorisé a ajouté une adresse a ce compte ( que le parent de ce user )');
        }
        createAddressDto.userId = userId;
        return this.addressService.createForUser(createAddressDto);
    }
    async getPaginatedAddresses(userId, res, page = '1', limit = '10') {
        let pageNumber = parseInt(page, 10);
        let limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || pageNumber < 1)
            pageNumber = 1;
        if (isNaN(limitNumber) || limitNumber < 1)
            limitNumber = 10;
        const { data, totalPages, totalItems } = await this.addressService.getPaginatedByUser(userId, pageNumber, limitNumber);
        res.setHeader('number-of-page', pageNumber.toString());
        res.setHeader('page-count', totalPages.toString());
        res.setHeader('result-count', totalItems.toString());
        res.status(200).json({
            data,
            page: pageNumber,
            totalPages,
            totalItems,
        });
    }
    async update(addressId, updateAddressDto, user) {
        try {
            const result = await this.addressService.update(addressId, updateAddressDto, user.id);
            if (result === null) {
                throw new common_1.NotFoundException(`Adresse avec l'id ${addressId} non trouvée.`);
            }
            if (result === 'OWNER_NOT_FOUND') {
                throw new common_1.NotFoundException("Utilisateur propriétaire de l'adresse introuvable.");
            }
            if (result === 'FORBIDDEN') {
                throw new common_1.ForbiddenException("Vous n'êtes pas autorisé à modifier cette adresse.");
            }
            return result;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                console.error('Erreur Prisma :', error.message);
                throw new common_1.NotFoundException(`Requête invalide : ${error.message}`);
            }
            console.error('[PATCH] Erreur inconnue :', error);
            throw error;
        }
    }
    async remove(addressId, user) {
        try {
            const userId = user.id;
            const result = await this.addressService.remove(addressId, userId);
            if (result === null) {
                throw new common_1.NotFoundException(`Adresse avec l'id ${addressId} non trouvée`);
            }
            if (result === 'OWNER_NOT_FOUND') {
                throw new common_1.NotFoundException("Utilisateur propriétaire introuvable.");
            }
            if (result === 'FORBIDDEN') {
                throw new common_1.ForbiddenException("Vous ne pouvez pas supprimer cette adresse.");
            }
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Erreur lors de la suppression de l\'adresse');
        }
    }
    async getAllAddresses(page = '1', limit = '10', res) {
        try {
            let pageNumber = parseInt(page, 10);
            let limitNumber = parseInt(limit, 10);
            if (isNaN(pageNumber) || pageNumber < 1) {
                pageNumber = 1;
            }
            if (isNaN(limitNumber) || limitNumber < 1) {
                limitNumber = 10;
            }
            const { data, pageCount, resultCount } = await this.addressService.getPaginatedAddresses(pageNumber, limitNumber);
            res.setHeader('number-of-page', pageNumber.toString());
            res.setHeader('page-count', pageCount.toString());
            res.setHeader('result-count', resultCount.toString());
            return res.status(200).json(data);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Erreur lors de la récupération des adresses paginées');
        }
    }
};
exports.AddressController = AddressController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_2.ApiResponse)({
        status: 200,
        description: 'Liste paginée des adresses',
        type: paginated_address_response_dto_1.PaginatedAddressResponseDto,
    }),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_2.ApiOperation)({ summary: 'Créer une adresse pour soi-même' }),
    (0, swagger_2.ApiResponse)({
        status: 201, description: 'addresse créé', type: address_response_dto_1.AddressResponseDto, example: {
            "id": "530fe065-0dc4-48ce-9810-b7d5b23285c7",
            "street": "Bourguiba ",
            "city": "paris",
            "postalCode": "10001",
            "country": "France",
        }
    }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Non autorisé' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_address_dto_1.CreateAddressDto, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "createAddressForSelf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_2.ApiOperation)({ summary: 'Récupérer une adresse par son ID' }),
    (0, swagger_2.ApiResponse)({ status: 200, description: 'Adresse trouvée', type: address_response_dto_1.AddressResponseDto }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Adresse non trouvée' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Accès interdit' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "getAddressById", null);
__decorate([
    (0, common_1.Post)(':userId'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_2.ApiResponse)({
        status: 200,
        description: 'Liste paginée des adresses',
        type: paginated_address_response_dto_1.PaginatedAddressResponseDto,
    }),
    (0, swagger_2.ApiOperation)({ summary: 'Créer une adresse pour un enfant' }),
    (0, swagger_2.ApiResponse)({ status: 201, type: address_response_dto_1.AddressResponseDto }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Accès refusé' }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Enfant introuvable' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_address_dto_1.CreateAddressDto, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "createAddressForChild", null);
__decorate([
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, common_1.Get)('user/:id'),
    (0, swagger_2.ApiOperation)({ summary: 'Lister les adresses par utilisateur avec pagination' }),
    (0, swagger_2.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_2.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_2.ApiResponse)({ status: 200, description: 'Liste paginée des adresses' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "getPaginatedAddresses", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_2.ApiOperation)({ summary: 'Modifier une adresse existante ' }),
    (0, swagger_2.ApiResponse)({ status: 200, description: 'Adresse modifiée avec succès', type: address_response_dto_1.AddressResponseDto }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Adresse non trouvée' }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Accès interdit' }),
    (0, swagger_2.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l’adresse à modifier', type: String }),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_address_dto_1.UpdateAddressDto, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_2.ApiOperation)({ summary: 'Supprimer une adresse' }),
    (0, swagger_2.ApiResponse)({ status: 200, description: 'Adresse supprimée avec succès', type: address_response_dto_1.AddressResponseDto }),
    (0, swagger_2.ApiResponse)({ status: 403, description: 'Accès interdit (non propriétaire ou non parent)' }),
    (0, swagger_2.ApiResponse)({ status: 404, description: 'Adresse non trouvée' }),
    (0, swagger_2.ApiResponse)({ status: 500, description: 'Erreur serveur inconnue' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_2.ApiOperation)({ summary: 'Récupérer toutes les adresses (admin)' }),
    (0, swagger_2.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_2.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_2.ApiResponse)({
        status: 200, description: 'Liste paginée des adresses', type: paginated_address_response_dto_1.PaginatedAddressResponseDto, example: {
            data: [
                {
                    "id": "062408dd-c2e5-4a7a-8a42-056fe1104d28",
                    "street": "42 Main Street",
                    "city": "paris",
                    "postalCode": "10001",
                    "country": "USA",
                    "userId": "5df8185f-b8fc-46bc-b275-eae4a82a557d",
                    "createdAt": "2025-06-26T10:09:56.674Z"
                },
                {
                    "id": "6934d9ec-14f3-485d-ac2d-dd62dda82707",
                    "street": "42 Main Street",
                    "city": "New York",
                    "postalCode": "10001",
                    "country": "USA",
                    "userId": "84e37570-486e-4e84-9873-7409200b5494",
                    "createdAt": "2025-06-25T09:37:52.634Z"
                },
            ],
            page: 2,
            totalPages: 5,
            totalItems: 50
        }
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AddressController.prototype, "getAllAddresses", null);
exports.AddressController = AddressController = __decorate([
    (0, swagger_2.ApiTags)('Addresses'),
    (0, swagger_2.ApiBasicAuth)('basic-auth'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Controller)('address'),
    __metadata("design:paramtypes", [address_service_1.AddressService,
        user_service_1.UserService,
        prisma_1.PrismaService])
], AddressController);
//# sourceMappingURL=address.controller.js.map