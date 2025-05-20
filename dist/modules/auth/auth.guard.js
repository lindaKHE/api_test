"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BasicAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_service_1 = require("../../service/user.service");
let BasicAuthGuard = BasicAuthGuard_1 = class BasicAuthGuard {
    constructor(userService) {
        this.userService = userService;
        this.logger = new common_1.Logger(BasicAuthGuard_1.name);
    }
    async getUserPasswordHash(username) {
        const user = await this.userService.findByUsername(username);
        return (user === null || user === void 0 ? void 0 : user.password) || null;
    }
    async getAllUsers() {
        const users = await this.userService.getAllUsers({});
        return users;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            this.logger.warn('Header Authorization manquant ou incorrect');
            throw new common_1.UnauthorizedException('Authentification Basic requise');
        }
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');
        const storedPasswordHash = await this.getUserPasswordHash(username);
        if (!storedPasswordHash) {
            this.logger.warn('Utilisateur introuvable');
            throw new common_1.UnauthorizedException('Identifiantss incorrects');
        }
        if (password === storedPasswordHash) {
            this.logger.log('Mot de passe égal au hash, bcrypt inutile');
            return true;
        }
        const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);
        if (isPasswordValid) {
            return true;
        }
        console.log(password);
        console.log(storedPasswordHash);
        this.logger.warn('Identifiants incorrects');
        throw new common_1.UnauthorizedException('Identifiants incorrects');
    }
};
exports.BasicAuthGuard = BasicAuthGuard;
exports.BasicAuthGuard = BasicAuthGuard = BasicAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], BasicAuthGuard);
//# sourceMappingURL=auth.guard.js.map