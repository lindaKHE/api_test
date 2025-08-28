import { OrderStatus } from '@prisma/client';
export declare const allowedOrderStatuses: ("CREATED" | "PAID" | "CANCELLED")[];
export declare function isValidOrderStatus(status: string): status is OrderStatus;
