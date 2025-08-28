import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
import { AddressResponseDto } from 'src/models/dto/address-response.dto';
import { Address } from '@prisma/client';
export declare class AddressService {
    private prisma;
    findUnique(addressId: string): Promise<Address | null>;
    constructor(prisma: PrismaService);
    private transformToAddressResponseDto;
    isChildOfParent(parentId: string, childId: string): Promise<boolean>;
    createForUser(createAddressDto: CreateAddressDto): Promise<AddressResponseDto>;
    createForChild(createAddressDto: CreateAddressDto): Promise<AddressResponseDto>;
    update(addressId: string, updateAddressDto: UpdateAddressDto, userId: string): Promise<AddressResponseDto | null | 'FORBIDDEN' | 'OWNER_NOT_FOUND'>;
    getById(id: string): Promise<AddressResponseDto & {
        userId: string;
    }>;
    remove(addressId: string, userId: string): Promise<AddressResponseDto | null | 'OWNER_NOT_FOUND' | 'FORBIDDEN'>;
    getAllByUserWithPermission(requesterId: string, targetUserId: string): Promise<AddressResponseDto[] | 'FORBIDDEN'>;
    getAllByUser(userId: string): Promise<{
        id: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
        createdAt: Date;
    }[]>;
    getPaginatedAddresses(page: number, limit: number): Promise<{
        data: {
            id: string;
            street: string;
            city: string;
            postalCode: string;
            country: string;
            userId: string;
            createdAt: Date;
        }[];
        pageCount: number;
        resultCount: number;
    }>;
    getAll(): Promise<{
        id: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
        userName: string;
        createdAt: Date;
    }[]>;
    getPaginatedByUser(userId: string, page: number, limit: number): Promise<{
        data: {
            id: string;
            street: string;
            city: string;
            postalCode: string;
            country: string;
            userId: string;
            createdAt: Date;
        }[];
        page: number;
        totalPages: number;
        totalItems: number;
    }>;
    getAllForUserAndChildren(userId: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            name: string | null;
            username: string | null;
            password: string | null;
            parentId: string | null;
            gender: string | null;
            isAdmin: boolean;
            firstname: string | null;
            birthdate: Date | null;
        };
    } & {
        id: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
        createdAt: Date;
    })[]>;
}
