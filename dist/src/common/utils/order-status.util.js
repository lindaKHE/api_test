"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedOrderStatuses = void 0;
exports.isValidOrderStatus = isValidOrderStatus;
const client_1 = require("@prisma/client");
exports.allowedOrderStatuses = Object.values(client_1.OrderStatus);
function isValidOrderStatus(status) {
    return exports.allowedOrderStatuses.includes(status);
}
//# sourceMappingURL=order-status.util.js.map