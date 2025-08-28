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
exports.AddressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../modules/prisma/prisma.service");
let AddressService = class AddressService {
    async findUnique(addressId) {
        return this.prisma.address.findUnique({
            where: { id: addressId },
        });
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    transformToAddressResponseDto(address) {
        var _a;
        return {
            id: address.id,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            userId: address.userId,
            userName: (_a = address.user) === null || _a === void 0 ? void 0 : _a.name,
        };
    }
    async isChildOfParent(parentId, childId) {
        const child = await this.prisma.user.findFirst({
            where: {
                id: childId,
                parentId: parentId,
            },
        });
        return !!child;
    }
    async createForUser(createAddressDto) {
        const { street, city, postalCode, country, userId } = createAddressDto;
        const address = await this.prisma.address.create({
            data: {
                street,
                city,
                postalCode,
                country,
                user: { connect: { id: userId } },
            },
        });
        return this.transformToAddressResponseDto(address);
    }
    async createForChild(createAddressDto) {
        const address = await this.prisma.address.create({
            data: {
                street: createAddressDto.street,
                city: createAddressDto.city,
                postalCode: createAddressDto.postalCode,
                country: createAddressDto.country,
                user: { connect: { id: createAddressDto.userId } },
            },
        });
        return this.transformToAddressResponseDto(address);
    }
    async update(addressId, updateAddressDto, userId) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!address) {
            return null;
        }
        const addressOwner = await this.prisma.user.findUnique({
            where: { id: address.userId },
        });
        if (!addressOwner) {
            return 'OWNER_NOT_FOUND';
        }
        const isOwner = address.userId === userId;
        const isParent = addressOwner.parentId === userId;
        if (!isOwner && !isParent) {
            return 'FORBIDDEN';
        }
        const updated = await this.prisma.address.update({
            where: { id: addressId },
            data: updateAddressDto,
        });
        return this.transformToAddressResponseDto(updated);
    }
    async getById(id) {
        const address = await this.prisma.address.findUnique({ where: { id } });
        if (!address) {
            return null;
        }
        return Object.assign(Object.assign({}, this.transformToAddressResponseDto(address)), { userId: address.userId });
    }
    async remove(addressId, userId) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!address) {
            return null;
        }
        const addressOwner = await this.prisma.user.findUnique({
            where: { id: address.userId },
        });
        if (!addressOwner) {
            return 'OWNER_NOT_FOUND';
        }
        const isOwner = address.userId === userId;
        const isParent = addressOwner.parentId === userId;
        if (!isOwner && !isParent) {
            return 'FORBIDDEN';
        }
        const deleted = await this.prisma.address.delete({
            where: { id: addressId },
        });
        return this.transformToAddressResponseDto(deleted);
    }
    async getAllByUserWithPermission(requesterId, targetUserId) {
        const isOwner = requesterId === targetUserId;
        const isParent = await this.isChildOfParent(requesterId, targetUserId);
        if (!isOwner && !isParent) {
            return 'FORBIDDEN';
        }
        const addresses = await this.getAllByUser(targetUserId);
        return addresses.map((a) => this.transformToAddressResponseDto(a));
    }
    async getAllByUser(userId) {
        return this.prisma.address.findMany({
            where: { userId },
        });
    }
    async getPaginatedAddresses(page, limit) {
        const offset = (page - 1) * limit;
        const totalCount = await this.prisma.address.count();
        const data = await this.prisma.address.findMany({
            skip: offset,
            take: limit,
            orderBy: {
                postalCode: 'asc',
            },
        });
        const pageCount = Math.ceil(totalCount / limit);
        return { data, pageCount, resultCount: totalCount };
    }
    async getAll() {
        const addresses = await this.prisma.address.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        return addresses.map((address) => ({
            id: address.id,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            userId: address.userId,
            userName: address.user.name,
            createdAt: address.createdAt,
        }));
    }
    async getPaginatedByUser(userId, page, limit) {
        const offset = (page - 1) * limit;
        const totalCount = await this.prisma.address.count({
            where: { userId },
        });
        const data = await this.prisma.address.findMany({
            where: { userId },
            skip: offset,
            take: limit,
            orderBy: { postalCode: 'asc' },
        });
        const pageCount = Math.ceil(totalCount / limit);
        return {
            data,
            page,
            totalPages: pageCount,
            totalItems: totalCount,
        };
    }
    async getAllForUserAndChildren(userId) {
        return this.prisma.address.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { user: { parentId: userId } },
                ],
            },
            include: { user: true },
        });
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressService);
//# sourceMappingURL=address.service.js.map