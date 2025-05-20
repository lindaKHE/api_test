import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateAddressDto } from './create-address.dto';
import { UpdateAddressDto } from './update-address.dto';
export declare class AddressService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAddressDto: CreateAddressDto): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }>;
    update(id: string, updateAddressDto: UpdateAddressDto): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }>;
    getAllByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }[]>;
    getAll(): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }[]>;
}
