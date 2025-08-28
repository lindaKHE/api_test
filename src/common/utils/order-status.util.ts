import { OrderStatus } from '@prisma/client';

export const allowedOrderStatuses = Object.values(OrderStatus);

export function isValidOrderStatus(status: string): status is OrderStatus {
  return allowedOrderStatuses.includes(status as OrderStatus);
}
