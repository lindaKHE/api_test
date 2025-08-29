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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../modules/prisma");
const client_1 = require("@prisma/client");
const order_status_util_1 = require("../common/utils/order-status.util");
const justification_status_enum_1 = require("../enums/src/enums/justification-status.enum");
let OrderService = class OrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(createOrderDto, userId) {
        const { customerId: inputCustomerId, articles } = createOrderDto;
        if (!articles || articles.length === 0) {
            return null;
        }
        const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
            return null;
        }
        let customerId = inputCustomerId;
        if (!customerId) {
            if (currentUser.parentId !== null) {
                return null;
            }
            customerId = userId;
        }
        else {
            const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
            if (!customer || customer.parentId !== userId) {
                return null;
            }
        }
        const productIds = articles.map(a => Number(a.productId));
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                shortText: true,
                unitPrice: true,
                isSaleable: true,
                picture: true,
                orderMaxQuantity: true,
                vatRate: true,
                allowedProfiles: {
                    select: {
                        code: true,
                    },
                },
            },
        });
        const client = await this.prisma.user.findUnique({
            where: { id: customerId },
            include: { profiles: true },
        });
        if (!client) {
            return null;
        }
        const clientProfileCodes = client.profiles.map(p => p.code);
        for (const product of products) {
            const allowedCodes = product.allowedProfiles.map(p => p.code);
            if (allowedCodes.length > 0 &&
                !allowedCodes.some(code => clientProfileCodes.includes(code))) {
                return null;
            }
        }
        const nonSaleableProduct = products.find(p => !p.isSaleable);
        if (nonSaleableProduct) {
            return null;
        }
        let totalHtAmount = 0;
        let totalVatAmount = 0;
        const orderArticles = articles.map(article => {
            const product = products.find(p => p.id === Number(article.productId));
            if (!product)
                return null;
            if (product.orderMaxQuantity !== null &&
                product.orderMaxQuantity !== undefined &&
                article.quantity > product.orderMaxQuantity) {
                return null;
            }
            const quantity = article.quantity;
            const unitPriceTTC = product.unitPrice;
            const vatRate = product.vatRate || 0;
            const lineTotalTTC = unitPriceTTC * quantity;
            const lineTotalVAT = lineTotalTTC * (vatRate / (100 + vatRate));
            const lineTotalHT = lineTotalTTC - lineTotalVAT;
            totalHtAmount += lineTotalHT;
            totalVatAmount += lineTotalVAT;
            return {
                productId: product.id,
                quantity,
                unitPrice: product.unitPrice,
            };
        });
        if (orderArticles.includes(null)) {
            return null;
        }
        const totalAmount = totalHtAmount + totalVatAmount;
        const order = await this.prisma.order.create({
            data: {
                userId,
                customerId,
                totalAmount,
                totalVatAmount,
                totalHtAmount,
                articles: {
                    create: orderArticles,
                },
            },
            include: {
                customer: {
                    select: {
                        firstname: true,
                        name: true,
                    },
                },
                articles: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                shortText: true,
                                unitPrice: true,
                                picture: true,
                            },
                        },
                    },
                },
            },
        });
        const cleanedArticles = order.articles.map(article => {
            const { unitPrice } = article, rest = __rest(article, ["unitPrice"]);
            return rest;
        });
        return Object.assign(Object.assign({}, order), { articles: cleanedArticles });
    }
    async getOrders(user, filters, page = 1, limit = 10) {
        const where = {};
        if (user.isAdmin) {
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
                where.status = filters.status;
            }
        }
        else {
            const children = await this.prisma.user.findMany({
                where: { parentId: user.id },
                select: { id: true },
            });
            const childIds = children.map(c => c.id);
            where.customerId = { in: [user.id, ...childIds] };
        }
        const orders = await this.prisma.order.findMany({
            where,
            include: {
                customer: {
                    select: {
                        firstname: true,
                        name: true,
                    },
                },
                articles: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                shortText: true,
                                unitPrice: true,
                                vatRate: true,
                                picture: true,
                            },
                        },
                    },
                },
            },
            orderBy: (filters === null || filters === void 0 ? void 0 : filters.sortByAmount)
                ? { totalAmount: filters.sortByAmount }
                : undefined,
            skip: (page - 1) * limit,
            take: limit,
        });
        const total = await this.prisma.order.count({ where });
        const ordersWithTotals = orders.map(order => {
            const totalHtAmount = order.articles.reduce((sum, article) => {
                return sum + article.unitPrice * article.quantity;
            }, 0);
            const totalVatAmount = order.articles.reduce((sum, article) => {
                var _a, _b;
                const vatRate = (_b = (_a = article.product) === null || _a === void 0 ? void 0 : _a.vatRate) !== null && _b !== void 0 ? _b : 0;
                const lineHt = article.unitPrice * article.quantity;
                const lineVat = Math.round((lineHt * vatRate) / 100);
                return sum + lineVat;
            }, 0);
            return Object.assign(Object.assign({}, order), { totalAmount: totalHtAmount, totalVatAmount, totalAmountTTC: totalHtAmount + totalVatAmount });
        });
        return { items: ordersWithTotals, total };
    }
    async updateOrderStatus(orderId, status) {
        if (!(0, order_status_util_1.isValidOrderStatus)(status)) {
            return null;
        }
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return null;
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: status },
            include: {
                customer: {
                    select: {
                        firstname: true,
                        name: true,
                    },
                },
                articles: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                shortText: true,
                                unitPrice: true,
                                picture: true,
                            },
                        },
                    },
                },
            },
        });
        return updatedOrder;
    }
    async findAll() {
        return this.prisma.order.findMany({
            where: { isDeleted: false },
            include: { articles: true },
        });
    }
    async deleteOrder(id) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            return 'not_found';
        }
        if (order.isDeleted) {
            return 'already_deleted';
        }
        return this.prisma.order.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async attachJustification(params) {
        const { orderId, orderArticleId, file } = params;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new common_1.NotFoundException(`Commande ${orderId} introuvable`);
        const orderArticle = await this.prisma.orderArticle.findUnique({
            where: { id: orderArticleId },
        });
        if (!orderArticle || orderArticle.orderId !== orderId) {
            throw new common_1.NotFoundException(`Ligne de commande ${orderArticleId} introuvable pour la commande ${orderId}`);
        }
        const justification = await this.prisma.justificationDocument.create({
            data: {
                orderArticleId: orderArticleId,
                path: file.path,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                status: justification_status_enum_1.JustificationStatusTs.A_VALIDER,
            },
        });
        return justification;
    }
    async getJustificationById(id) {
        return this.prisma.justificationDocument.findUnique({
            where: { id },
        });
    }
    async getAllJustifications(status) {
        return this.prisma.justificationDocument.findMany({
            where: status ? { status } : {},
            include: { orderArticle: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateJustificationStatus(id, status) {
        const justification = await this.prisma.justificationDocument.findUnique({
            where: { id },
            include: {
                orderArticle: {
                    include: {
                        order: { include: { user: true } },
                        product: { include: { allowedProfiles: true } },
                    },
                },
            },
        });
        if (!justification)
            return null;
        const updated = await this.prisma.justificationDocument.update({
            where: { id },
            data: { status },
        });
        if (status === client_1.JustificationStatus.VALIDE) {
            const userId = justification.orderArticle.order.user.id;
            const allowedProfiles = justification.orderArticle.product.allowedProfiles;
            if (allowedProfiles.length > 0) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        profiles: {
                            connect: allowedProfiles.map((p) => ({ id: p.id })),
                        },
                    },
                });
            }
        }
        return updated;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map