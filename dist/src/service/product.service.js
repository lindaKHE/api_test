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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../modules/prisma");
let ProductService = class ProductService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        var _a;
        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                shortText: dto.shortText,
                unitPrice: dto.unitPrice,
                isSaleable: dto.isSaleable,
                picture: dto.picture,
                orderMaxQuantity: dto.orderMaxQuantity,
                vatRate: (_a = dto.vatRate) !== null && _a !== void 0 ? _a : 0,
                allowedProfiles: dto.allowedProfileCodes
                    ? {
                        connect: dto.allowedProfileCodes.map(code => ({ code })),
                    }
                    : undefined,
            },
            include: {
                allowedProfiles: true,
            },
        });
        return product || null;
    }
    async getProducts(user, options) {
        const { sort, search, page, limit } = options;
        const whereClause = {
            name: search ? { contains: search, mode: 'insensitive' } : undefined,
        };
        const items = await this.prisma.product.findMany({
            where: whereClause,
            skip: (page - 1) * limit,
            take: limit,
        });
        const total = await this.prisma.product.count({ where: whereClause });
        return { items, total };
    }
    async getProductById(id) {
        const product = await this.prisma.product.findUnique({ where: { id: Number(id) } });
        if (!product)
            return null;
        return {
            id: product.id,
            name: product.name,
            shortText: product.shortText,
            unitPrice: product.unitPrice,
            picture: product.picture,
            isSaleable: product.isSaleable,
            orderMaxQuantity: product.orderMaxQuantity,
            vatRate: product.vatRate,
        };
    }
    async findAll({ isSaleable, allowedProfileCode, page = 1, limit = 10 }) {
        const filters = {};
        if (isSaleable !== undefined) {
            filters.isSaleable = isSaleable === 'true';
        }
        if (allowedProfileCode) {
            filters.allowedProfiles = {
                some: {
                    code: allowedProfileCode,
                },
            };
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where: filters,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    allowedProfiles: true,
                },
            }),
            this.prisma.product.count({ where: filters }),
        ]);
        return { items, total };
    }
    async findById(id) {
        return this.prisma.product.findUnique({
            where: { id },
        });
    }
    async findSaleableByUserProfiles(userId, page = 1, limit = 10) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profiles: true },
        });
        if (!user)
            return null;
        const profileCodes = user.profiles.map(p => p.code);
        return this.prisma.product.findMany({
            where: {
                isSaleable: true,
                allowedProfiles: {
                    some: {
                        code: { in: profileCodes },
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            include: { allowedProfiles: true },
        });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }
    async disableProduct(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return null;
        }
        if (!product.isSaleable) {
            return product;
        }
        return this.prisma.product.update({
            where: { id },
            data: { isSaleable: false },
        });
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map