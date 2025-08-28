"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERole = exports.EOrderSort = exports.EUserSortColumn = exports.EGender = void 0;
var EGender;
(function (EGender) {
    EGender["WOMAN"] = "WOMAN";
    EGender["MAN"] = "MAN";
})(EGender || (exports.EGender = EGender = {}));
var EUserSortColumn;
(function (EUserSortColumn) {
    EUserSortColumn["FIRST_NAME"] = "firstName";
    EUserSortColumn["NAME"] = "name";
})(EUserSortColumn || (exports.EUserSortColumn = EUserSortColumn = {}));
var EOrderSort;
(function (EOrderSort) {
    EOrderSort["ASC"] = "asc";
    EOrderSort["DESC"] = "desc";
})(EOrderSort || (exports.EOrderSort = EOrderSort = {}));
var ERole;
(function (ERole) {
    ERole["ADMIN"] = "ADMIN";
    ERole["PARENT"] = "PARENT";
    ERole["CHILD"] = "CHILD";
})(ERole || (exports.ERole = ERole = {}));
//# sourceMappingURL=user.interface.js.map