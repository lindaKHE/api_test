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
const user_module_1 = require("./user/user.module");
const prisma_1 = require("./modules/prisma");
const address_service_1 = require("./service/address.service");
const address_controller_1 = require("./controllers/address.controller");
const auth_module_1 = require("./modules/auth/auth.module");
const user_service_1 = require("./service/user.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        providers: [address_service_1.AddressService, user_service_1.UserService],
        controllers: [address_controller_1.AddressController],
        imports: [prisma_1.PrismaModule, user_module_1.UserModule, auth_module_1.AuthModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map