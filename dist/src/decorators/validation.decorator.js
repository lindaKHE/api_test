"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatedParam = exports.ValidatedBody = exports.ValidatedQuery = void 0;
const common_1 = require("@nestjs/common");
function createValidationDecorator(decoratorFactory) {
    return (property, options = {}) => {
        const finalOptions = Object.assign({ transform: true, whitelist: true, forbidNonWhitelisted: true }, options);
        const decorator = decoratorFactory(property);
        const validationPipe = new common_1.ValidationPipe(finalOptions);
        return (target, propertyKey, parameterIndex) => {
            decorator(target, propertyKey, parameterIndex);
            validationPipe.transform(target, {
                type: 'param',
                metatype: String,
            });
        };
    };
}
exports.ValidatedQuery = createValidationDecorator(common_1.Query);
exports.ValidatedBody = createValidationDecorator(common_1.Body);
exports.ValidatedParam = createValidationDecorator(common_1.Param);
//# sourceMappingURL=validation.decorator.js.map