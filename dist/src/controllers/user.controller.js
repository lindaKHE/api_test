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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../service/user.service");
const create_user_dto_1 = require("../models/dto/create-user.dto");
const update_user_dto_1 = require("../models/dto/update-user.dto");
const user_response_dto_1 = require("../models/dto/user-response.dto");
const auth_guard_1 = require("../modules/auth/auth.guard");
const user_interface_1 = require("../interfaces/user.interface");
const address_service_1 = require("../service/address.service");
const admin_basic_auth_guard_1 = require("../modules/auth/admin-basic-auth.guard");
const currentUser_decorator_1 = require("../decorators/currentUser.decorator");
const create_child_dto_1 = require("../models/dto/create-child.dto");
const swagger_1 = require("@nestjs/swagger");
const library_1 = require("@prisma/client/runtime/library");
let UserController = class UserController {
    constructor(userService, addressService) {
        this.userService = userService;
        this.addressService = addressService;
    }
    async create(createUserDto) {
        var _a, _b;
        try {
            const result = await this.userService.createUser(createUserDto);
            if (result === 'PARENT_NOT_FOUND') {
                throw new common_1.NotFoundException("Parent introuvable.");
            }
            if (result === 'PASSWORD_REQUIRED') {
                throw new common_1.BadRequestException('Le mot de passe est requis pour les utilisateurs sans parent.');
            }
            if (result === 'INVALID_PROFILES') {
                throw new common_1.NotFoundException('Un ou plusieurs profils sont invalides.');
            }
            if (!result || typeof result !== 'object') {
                throw new common_1.BadRequestException('Un ou plusieurs profils sont invalides ou données manquantes.');
            }
            return result;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('user_username_key'))) {
                throw new common_1.ConflictException("Le nom d'utilisateur est déjà utilisé.");
            }
            throw new common_1.InternalServerErrorException('Erreur lors de la création de l’utilisateur.');
        }
    }
    async getMe(currentUser) {
        if (!currentUser) {
            throw new common_1.ForbiddenException("Accès interdit à ce profil.");
        }
        return this.userService.transformToUserResponseDto(currentUser);
    }
    async getUsers(res, page = '1', limit = '10', sortBy = user_interface_1.EUserSortColumn.NAME, sortOrder = user_interface_1.EOrderSort.ASC) {
        let pageNumber = parseInt(page, 10);
        let limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || pageNumber < 1)
            pageNumber = 1;
        if (isNaN(limitNumber) || limitNumber < 1)
            limitNumber = 10;
        const { data, pageCount, resultCount } = await this.userService.getPaginatedUsers(pageNumber, limitNumber, sortBy, sortOrder);
        res.setHeader('number-of-page', pageNumber.toString());
        res.setHeader('page-count', pageCount.toString());
        res.setHeader('columns', 'name,createdAt');
        res.setHeader('result-count', resultCount.toString());
        res.status(200).json({
            data,
            page: pageNumber,
            pageCount,
            resultCount,
        });
    }
    async getChildren(res, user, page = '1', limit = '10', sortBy = user_interface_1.EUserSortColumn.NAME, sortOrder = user_interface_1.EOrderSort.ASC) {
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
        const { data, pageCount, resultCount } = await this.userService.getMyChildren(user.id, pageNumber, limitNumber, sortBy, sortOrder);
        if (!data || data.length === 0) {
            throw new common_1.NotFoundException(`Aucun enfant trouvé pour le parent avec l'id ${user.id}`);
        }
        res.setHeader('number-of-page', pageNumber.toString());
        res.setHeader('page-count', pageCount.toString());
        res.setHeader('result-count', resultCount.toString());
        res.status(200).json({
            data,
            page: pageNumber,
            pageCount,
            resultCount,
        });
    }
    async getAllByUser(userId, currentUser) {
        const isAllowed = userId === currentUser.id || await this.userService.isChildOfParent(currentUser.id, userId);
        if (!isAllowed)
            throw new common_1.ForbiddenException("Accès refusé.");
        return this.addressService.getAllByUser(userId);
    }
    async getById(id, currentUser) {
        if (!currentUser.isAdmin) {
            const isSelf = id === currentUser.id;
            const isChild = await this.userService.isChildOfParent(currentUser.id, id);
            if (!isSelf && !isChild) {
                throw new common_1.ForbiddenException("Accès interdit à ce profil.");
            }
        }
        const user = await this.userService.getUserById(id);
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
        }
        return user;
    }
    async createChild(user, dto) {
        const result = await this.userService.createChild(user.id, dto);
        if (result === 'PARENT_NOT_FOUND') {
            throw new common_1.NotFoundException("Parent introuvable.");
        }
        if (result === 'USERNAME_CONFLICT') {
            throw new common_1.ConflictException("Le nom d'utilisateur est déjà utilisé.");
        }
        if (result === 'INVALID_PROFILES') {
            throw new common_1.NotFoundException('Un ou plusieurs profils sont invalides.');
        }
        if (!result || typeof result !== 'object') {
            throw new common_1.ForbiddenException("Seuls les parents peuvent créer des comptes enfants");
        }
        return result;
    }
    async updateUser(id, updateUserDto, currentUser) {
        const existingUser = await this.userService.getUserById(id);
        if (!existingUser)
            throw new common_1.NotFoundException('Utilisateur avec l id ${id} non trouvé.');
        if (!existingUser.parentId && !currentUser.isAdmin) {
            throw new common_1.UnauthorizedException("Vous n'avez pas le droit de modifier ce parent.");
        }
        if (existingUser.parentId && existingUser.parentId !== currentUser.id) {
            throw new common_1.UnauthorizedException("Vous ne pouvez modifier que vos enfants.");
        }
        const updatedUser = await this.userService.updateUser(id, updateUserDto);
        if (!updatedUser)
            throw new common_1.BadRequestException("Les données fournies sont invalides.");
        return updatedUser;
    }
    async deleteChild(user, childId) {
        const deletedChild = await this.userService.deleteChild(user.id, childId);
        if (!deletedChild)
            throw new common_1.NotFoundException('Enfant avec lid ${childId} non trouvé pour le parent ${user.id}.');
        return deletedChild;
    }
    async deleteUser(id) {
        const deletedUser = await this.userService.deleteUser(id);
        if (!deletedUser)
            throw new common_1.NotFoundException('Utilisateur avec l id ${id} non trouvé.');
        return deletedUser;
    }
    async removeProfilesFromUser(id, body) {
        const result = await this.userService.removeProfilesFromUser(id, body.profileCodes);
        if (result === 'NOT_FOUND') {
            throw new common_1.NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
        }
        if (result === 'NOT_LINKED') {
            throw new common_1.BadRequestException('Aucun des profils à retirer n’est associé à cet utilisateur.');
        }
        return this.userService.transformToUserResponseDto(result);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard, admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un utilisateur' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiResponse)({
        status: 201, description: 'Utilisateur créé', type: user_response_dto_1.UserResponseDto, example: {
            "id": "d0b5844b-3886-4911-8947-0b5020c64cf5",
            "name": "enfant de ahmed",
            "firstname": " skhiri",
            "username": " es sk",
            "parentId": "a1aae375-0a9f-46e9-9401-4522bdeaecb1",
            "birthdate": "09/05/2002",
            "gender": "man",
            "createdAt": "16/07/2025 02:16:54",
            "addresses": ["..."],
            "profiles": {
                "code": "jeune",
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Nom d'utilisateur déjà utilisé" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erreur lors de la création de l’utilisateur' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer ses propres informations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur connecté', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit' }),
    __param(0, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(admin_basic_auth_guard_1.AdminBasicAuthGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les utilisateurs avec pagination et tri' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: user_interface_1.EUserSortColumn }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: user_interface_1.EOrderSort }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)('/children'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les enfants du parent connecté avec pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: user_interface_1.EUserSortColumn, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: user_interface_1.EOrderSort, required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Liste paginée des enfants',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Aucun enfant trouvé' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getChildren", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les adresses par utilisateur' }),
    (0, swagger_1.ApiParam)({ name: 'userId' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllByUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un utilisateur par ID (soi-même, enfant, ou admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès interdit' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getById", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)('children'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un enfant pour le parent connecté' }),
    (0, swagger_1.ApiBody)({ type: create_child_dto_1.CreateChildDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Seuls les parents peuvent créer un enfant' }),
    __param(0, (0, currentUser_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_child_dto_1.CreateChildDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createChild", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un utilisateur (admin ou parent)' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, currentUser_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)('children/:childId'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un enfant' }),
    (0, swagger_1.ApiParam)({ name: 'childId' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    __param(0, (0, currentUser_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteChild", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un utilisateur' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Patch)(':id/remove-profiles'),
    (0, common_1.UseGuards)(auth_guard_1.BasicAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer des profils d’un utilisateur' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiBody)({ schema: { example: { profileCodes: ['PARENT', 'CHILD'] } } }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeProfilesFromUser", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Utilisateur'),
    (0, swagger_1.ApiBasicAuth)('basic-auth'),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService, address_service_1.AddressService])
], UserController);
//# sourceMappingURL=user.controller.js.map