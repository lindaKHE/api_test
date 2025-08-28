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
exports.PaginatedAddressResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const address_response_dto_1 = require("./dto/address-response.dto");
class PaginatedAddressResponseDto {
}
exports.PaginatedAddressResponseDto = PaginatedAddressResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [address_response_dto_1.AddressResponseDto] }),
    __metadata("design:type", Array)
], PaginatedAddressResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], PaginatedAddressResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], PaginatedAddressResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    __metadata("design:type", Number)
], PaginatedAddressResponseDto.prototype, "totalItems", void 0);
//# sourceMappingURL=paginated-address-response.dto.js.map