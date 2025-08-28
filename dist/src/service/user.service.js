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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../modules/prisma/prisma.service");
const transform_user_dto_1 = require("../models/dto/transform-user-dto");
const bcrypt = require("bcrypt");
const user_interface_1 = require("../interfaces/user.interface");
const transform_user_dto_withoutPassword_1 = require("../models/dto/transform-user-dto-withoutPassword");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    transformToUserResponseDto(user) {
        var _a;
        const today = new Date();
        const age = user.birthdate ? today.getFullYear() - user.birthdate.getFullYear() : null;
        function getImProfile(age) {
            if (age === null)
                return null;
            if (age < 10)
                return { code: 'enfant', label: 'Enfant' };
            if (age < 25)
                return { code: 'jeune', label: 'Jeune' };
            if (age < 50)
                return { code: 'tout_public', label: 'Tout public' };
            return { code: 'senior', label: 'Senior' };
        }
        const implicitProfile = getImProfile(age);
        return {
            id: user.id,
            name: user.name,
            firstname: user.firstname,
            username: user.username,
            parentId: user.parentId,
            birthdate: user.birthdate ? user.birthdate.toLocaleDateString('fr-FR') : null,
            gender: user.gender || null,
            createdAt: user.createdAt ? user.createdAt.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }) : null,
            addresses: user.addresses && user.addresses.length > 0
                ? user.addresses.map(address => this.transformToAddressResponseDto(address))
                : [],
            profiles: {
                explicites: ((_a = user.profiles) === null || _a === void 0 ? void 0 : _a.map(p => ({ code: p.code, label: p.label }))) || [],
                implicite: implicitProfile,
            }
        };
    }
    transformToAddressResponseDto(address) {
        var _a;
        return {
            id: address.id,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            userName: ((_a = address.user) === null || _a === void 0 ? void 0 : _a.name) || '',
            userId: address.userId,
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
    async createUser(createUserDto) {
        const { profileCodes } = createUserDto;
        const userData = (0, transform_user_dto_1.transformUserDto)(createUserDto);
        if (userData.parentId) {
            const parent = await this.prisma.user.findUnique({ where: { id: userData.parentId } });
            if (!parent)
                return 'PARENT_NOT_FOUND';
            userData.password = parent.password;
        }
        else {
            if (!userData.password)
                return 'PASSWORD_REQUIRED';
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        let profiles = [];
        if (profileCodes === null || profileCodes === void 0 ? void 0 : profileCodes.length) {
            profiles = await this.prisma.profile.findMany({ where: { code: { in: profileCodes } } });
            if (profiles.length !== profileCodes.length)
                return 'INVALID_PROFILES';
        }
        const user = await this.prisma.user.create({
            data: Object.assign(Object.assign({}, userData), (profiles.length > 0 && {
                profiles: {
                    connect: profiles.map((p) => ({ id: p.id })),
                },
            })),
            include: { addresses: true, profiles: true },
        });
        return this.transformToUserResponseDto(user);
    }
    async createChild(parentId, createUserDto) {
        const parent = await this.prisma.user.findUnique({ where: { id: parentId } });
        if (!parent)
            return 'PARENT_NOT_FOUND';
        const existingUser = await this.prisma.user.findUnique({
            where: { username: createUserDto.username },
        });
        if (existingUser)
            return 'USERNAME_CONFLICT';
        const { profileCodes } = createUserDto;
        const childData = (0, transform_user_dto_withoutPassword_1.transformUserDtoWithoutPassword)(createUserDto);
        delete childData.parentId;
        if (childData.birthdate) {
            childData.birthdate = new Date(childData.birthdate);
        }
        let profiles = [];
        if (profileCodes === null || profileCodes === void 0 ? void 0 : profileCodes.length) {
            profiles = await this.prisma.profile.findMany({
                where: { code: { in: profileCodes } }
            });
            if (profiles.length !== profileCodes.length) {
                return 'INVALID_PROFILES';
            }
        }
        const createdChild = await this.prisma.user.create({
            data: Object.assign(Object.assign({}, childData), { parentId: parent.id, profiles: {
                    connect: profiles.map(p => ({ id: p.id }))
                } }),
            include: { profiles: true, addresses: true },
        });
        return this.transformToUserResponseDto(createdChild);
    }
    async getMyChildren(parentId, page, limit, sortBy = user_interface_1.EUserSortColumn.NAME, sortOrder = user_interface_1.EOrderSort.ASC) {
        const skip = (page - 1) * limit;
        const [resultCount, children] = await this.prisma.$transaction([
            this.prisma.user.count({
                where: { parentId },
            }),
            this.prisma.user.findMany({
                where: { parentId },
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder.toLowerCase(),
                },
                include: {
                    profiles: true,
                    addresses: true,
                },
            }),
        ]);
        const pageCount = Math.ceil(resultCount / limit);
        return {
            data: children.map(child => this.transformToUserResponseDto(child)),
            pageCount,
            resultCount,
        };
    }
    async deleteChild(parentId, childId) {
        const child = await this.prisma.user.findUnique({
            where: { id: childId },
            include: { profiles: true, addresses: true },
        });
        if (!child || child.parentId !== parentId) {
            return null;
        }
        await this.prisma.user.update({
            where: { id: childId },
            data: {
                profiles: { set: [] },
            },
        });
        await this.prisma.address.deleteMany({
            where: { userId: childId },
        });
        const deletedChild = await this.prisma.user.delete({
            where: { id: childId },
        });
        return this.transformToUserResponseDto(deletedChild);
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { addresses: true, profiles: true },
        });
        if (!user) {
            return null;
        }
        await this.prisma.user.update({
            where: { id },
            data: {
                profiles: { set: [] },
            },
        });
        await this.prisma.address.deleteMany({
            where: { userId: id },
        });
        const deletedUser = await this.prisma.user.delete({
            where: { id },
        });
        return this.transformToUserResponseDto(deletedUser);
    }
    async removeProfilesFromUser(userId, profileCodes) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profiles: true },
        });
        if (!user)
            return 'NOT_FOUND';
        const profilesToRemove = await this.prisma.profile.findMany({
            where: {
                code: { in: profileCodes }
            },
            select: { id: true },
        });
        const profileIdsToRemove = profilesToRemove.map(p => p.id);
        const userWithProfiles = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profiles: true },
        });
        const linkedProfileIds = (userWithProfiles === null || userWithProfiles === void 0 ? void 0 : userWithProfiles.profiles.map(p => p.id)) || [];
        const validProfileIds = profileIdsToRemove.filter(id => linkedProfileIds.includes(id));
        if (validProfileIds.length === 0) {
            return 'NOT_LINKED';
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                profiles: {
                    disconnect: profilesToRemove.map(p => ({ id: p.id })),
                },
            },
        });
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { profiles: true },
        });
    }
    async findByUserPassword(username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: { password: true },
        });
        if (!user)
            return null;
        return user.password;
    }
    async findByusername(username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: {
                addresses: true,
                profiles: true,
                children: true,
            },
        });
        if (!user)
            return null;
        return user;
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { addresses: true, profiles: true },
        });
        return user ? this.transformToUserResponseDto(user) : null;
    }
    async updateUser(id, updateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const { profileCodes } = updateUserDto, rest = __rest(updateUserDto, ["profileCodes"]);
        const dataToUpdate = Object.assign({}, rest);
        if (updateUserDto.birthdate) {
            dataToUpdate.birthdate = new Date(updateUserDto.birthdate + 'T00:00:00');
        }
        if (profileCodes === null || profileCodes === void 0 ? void 0 : profileCodes.length) {
            const profiles = await this.prisma.profile.findMany({
                where: { code: { in: profileCodes } },
            });
            if (profiles.length !== profileCodes.length) {
                return null;
            }
            dataToUpdate.profiles = {
                connect: profiles.map(p => ({ id: p.id })),
            };
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: {
                profiles: true,
                addresses: true,
            },
        });
        return this.transformToUserResponseDto(updatedUser);
    }
    async getAllUsers(filter) {
        const { name, profileCode } = filter;
        const condition = {};
        if (name) {
            condition.name = { contains: name };
        }
        if (profileCode) {
            condition.profiles = {
                some: { code: profileCode }
            };
        }
        const users = await this.prisma.user.findMany({
            where: condition,
            include: { addresses: true, profiles: true },
        });
        return users.map(user => this.transformToUserResponseDto(user));
    }
    async getPaginatedUsers(page, limit, sortBy = user_interface_1.EUserSortColumn.NAME, sortOrder = user_interface_1.EOrderSort.ASC) {
        const validSortColumns = Object.values(user_interface_1.EUserSortColumn);
        if (!validSortColumns.includes(sortBy)) {
            sortBy = user_interface_1.EUserSortColumn.NAME;
        }
        if (![user_interface_1.EOrderSort.ASC, user_interface_1.EOrderSort.DESC].includes(sortOrder)) {
            sortOrder = user_interface_1.EOrderSort.ASC;
        }
        const skip = (page - 1) * limit;
        const users = await this.prisma.user.findMany({
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: { profiles: true, addresses: true },
        });
        const resultCount = await this.prisma.user.count();
        const pageCount = Math.ceil(resultCount / limit);
        if (!users)
            return {
                data: [],
                pageCount: 0,
                resultCount: 0
            };
        return {
            data: users.map(user => this.transformToUserResponseDto(user)),
            pageCount,
            resultCount,
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map