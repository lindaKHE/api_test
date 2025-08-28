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
exports.UpdateAddressDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_address_dto_1 = require("./create-address.dto");
class UpdateAddressDto extends (0, swagger_1.PartialType)(create_address_dto_1.CreateAddressDto) {
}
exports.UpdateAddressDto = UpdateAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rue pasteur ', required: false }),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Paris', required: false }),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '75000', required: false }),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'France', required: false }),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "country", void 0);
//# sourceMappingURL=update-address.dto.js.map