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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const user_interface_1 = require("../../interfaces/user.interface");
const class_transformer_1 = require("class-transformer");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_interface_1.EGender, { message: 'Le genre doit être "WOMAN" ou "MAN"' }),
    (0, class_transformer_1.Transform)(({ value }) => value === null || value === void 0 ? void 0 : value.toUpperCase()),
    (0, swagger_1.ApiProperty)({ enum: user_interface_1.EGender, example: user_interface_1.EGender.WOMAN }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ example: ['ETUDIANT', 'PMR'] }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "profileCodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'khelifa' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'linda' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2000-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "birthdate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10 rue des Lilas' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Paris' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '75000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'France' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_interface_1.ERole),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
//# sourceMappingURL=create-user.dto.js.map