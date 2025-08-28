"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("./prisma");
const address_service_1 = require("../service/address.service");
const address_controller_1 = require("../controllers/address.controller");
const auth_module_1 = require("./auth/auth.module");
const user_service_1 = require("../service/user.service");
const user_controller_1 = require("../controllers/user.controller");
const product_controller_1 = require("../controllers/product.controller");
const product_service_1 = require("../service/product.service");
const order_module_1 = require("./order.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        providers: [address_service_1.AddressService, user_service_1.UserService, product_service_1.ProductService, prisma_1.PrismaService],
        controllers: [address_controller_1.AddressController, user_controller_1.UserController, product_controller_1.ProductController],
        imports: [order_module_1.OrderModule, prisma_1.PrismaModule, auth_module_1.AuthModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map