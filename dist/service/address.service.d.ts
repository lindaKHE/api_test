import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
export declare class AddressService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAddressDto: CreateAddressDto): Promise<{
        street: string;
        city: string;
        postalCode: string;
        country: string;
        id: string;
        userId: string;
        createdAt: Date;
    }>;
    update(id: string, updateAddressDto: UpdateAddressDto): Promise<{
        street: string;
        city: string;
        postalCode: string;
        country: string;
        id: string;
        userId: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        street: string;
        city: string;
        postalCode: string;
        country: string;
        id: string;
        userId: string;
        createdAt: Date;
    }>;
    getAllByUser(userId: string): Promise<{
        street: string;
        city: string;
        postalCode: string;
        country: string;
        id: string;
        userId: string;
        createdAt: Date;
    }[]>;
    getAll(): Promise<{
        street: string;
        city: string;
        postalCode: string;
        country: string;
        id: string;
        userId: string;
        createdAt: Date;
    }[]>;
}
