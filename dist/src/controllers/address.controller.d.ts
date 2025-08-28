import { AddressService } from '../service/address.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
import { AddressResponseDto } from 'src/models/dto/address-response.dto';
import { UserService } from 'src/service/user.service';
import { PrismaService } from 'src/modules/prisma';
import { Response } from 'express';
export declare class AddressController {
    private readonly addressService;
    private readonly userService;
    private readonly prisma;
    constructor(addressService: AddressService, userService: UserService, prisma: PrismaService);
    createAddressForSelf(createAddressDto: CreateAddressDto, currentUser: any): Promise<AddressResponseDto>;
    getAddressById(addressId: string, currentUser: any): Promise<AddressResponseDto>;
    createAddressForChild(userId: string, createAddressDto: CreateAddressDto, currentUser: any): Promise<AddressResponseDto>;
    getPaginatedAddresses(userId: string, res: Response, page?: string, limit?: string): Promise<void>;
    update(addressId: string, updateAddressDto: UpdateAddressDto, user: any): Promise<AddressResponseDto>;
    remove(addressId: string, user: any): Promise<AddressResponseDto>;
    getAllAddresses(page: string, limit: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
