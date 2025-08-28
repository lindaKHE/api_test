import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    userProfile: any;
    constructor();
    private readonly logger;
    onModuleDestroy(): Promise<void>;
    onModuleInit(): Promise<void>;
}
