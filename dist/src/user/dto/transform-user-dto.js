"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUserDto = transformUserDto;
function transformUserDto(data) {
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.username && { username: data.username })), (data.password && { password: data.password })), (data.name !== undefined && { name: data.name })), (data.firstname !== undefined && { firstname: data.firstname })), (data.birthdate !== undefined && { birthdate: new Date(data.birthdate) }));
}
//# sourceMappingURL=transform-user-dto.js.map