import { AddressService } from '../service/address.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
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
    getAll(): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }[]>;
    findByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        street: string;
        city: string;
        postalCode: string;
        country: string;
        userId: string;
    }[]>;
}
