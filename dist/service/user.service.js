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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../modules/prisma/prisma.service");
const common_2 = require("@nestjs/common");
const transform_user_dto_1 = require("../models/dto/transform-user-dto");
const library_1 = require("@prisma/client/runtime/library");
const bcrypt = require("bcrypt");
const common_3 = require("@nestjs/common");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    transformToUserResponseDto(user) {
        var _a;
        return {
            id: user.id,
            name: user.name,
            firstname: user.firstname,
            birthdate: user.birthdate,
            EGender: user.gender || null,
            createdAt: user.createdAt.toLocaleDateString('fr-FR'),
            addresses: (_a = user.addresses) === null || _a === void 0 ? void 0 : _a.map(address => ({
                street: address.street,
                city: address.city,
                postalCode: address.postalCode,
                country: address.country,
            })),
        };
    }
    async createUser(createUserDto) {
        var _a, _b;
        const userData = (0, transform_user_dto_1.transformUserDto)(createUserDto);
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        else {
            delete userData.password;
        }
        try {
            const user = await this.prisma.user.create({
                data: userData,
            });
            return this.transformToUserResponseDto(user);
        }
        catch (error) {
            if (error.code === 'P2002' &&
                ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('user_username_key'))) {
                throw new common_3.HttpException("Le nom d'utilisateur est déjà utilisé.", common_3.HttpStatus.CONFLICT);
            }
            console.error('Erreur lors de la création de l\'utilisateur :', error);
            throw new common_3.HttpException('Échec de la création utilisateur', common_3.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUser(id) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new common_2.NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
            }
            const deletedUser = await this.prisma.user.delete({ where: { id } });
            return deletedUser;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                throw new common_2.NotFoundException(`Requête invalide : ${error.message}`);
            }
            throw error;
        }
    }
    async findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }
    async getUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { addresses: true },
        });
    }
    async updateUser(id, updateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
        return this.transformToUserResponseDto(updatedUser);
    }
    async getAllUsers(filter) {
        const { nom } = filter;
        const Condition = nom ? { name: { contains: nom, mode: 'insensitive' } } : {};
        const users = await this.prisma.user.findMany({
            where: Condition,
            include: { addresses: true },
        });
        console.log(users);
        return users.map(this.transformToUserResponseDto);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map