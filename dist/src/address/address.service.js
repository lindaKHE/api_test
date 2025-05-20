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
const library_1 = require("@prisma/client/runtime/library");
let AddressService = class AddressService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAddressDto) {
        const { street, city, postalCode, country, userId } = createAddressDto;
        return this.prisma.address.create({
            data: {
                street,
                city,
                postalCode,
                country,
                user: { connect: { id: userId } },
            },
        });
    }
    async update(id, updateAddressDto) {
        try {
            const address = await this.prisma.address.findUnique({ where: { id } });
            if (!address) {
                throw new common_1.NotFoundException(`Adresse avec l'id ${id} introuvable.`);
            }
            return await this.prisma.address.update({
                where: { id },
                data: updateAddressDto,
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                console.error('Erreur Prisma :', error.message);
                throw new common_1.NotFoundException(`Requête invalide : ${error.message}`);
            }
            console.error('Erreur inconnue :', error);
            throw error;
        }
    }
    async remove(id) {
        const address = await this.prisma.address.findUnique({ where: { id } });
        if (!address) {
            throw new common_1.NotFoundException(`Adresse avec l'id ${id} non trouvée.`);
        }
        return this.prisma.address.delete({ where: { id } });
    }
    async getAllByUser(userId) {
        return this.prisma.address.findMany({
            where: { userId },
        });
    }
    async getAll() {
        return this.prisma.address.findMany();
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressService);
//# sourceMappingURL=address.service.js.map