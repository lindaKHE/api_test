import {
	Body,
	Param,
	Query,
	ValidationPipe,
	type ValidationPipeOptions,
} from '@nestjs/common';

function createValidationDecorator(
	decoratorFactory: (
		property?: string | (string | undefined),
	) => ParameterDecorator,
): (property?: string, options?: ValidationPipeOptions) => ParameterDecorator {
	return (property?: string, options: ValidationPipeOptions = {}) => {
		const finalOptions = {
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			...options,
		};

		const decorator = decoratorFactory(property);
		const validationPipe = new ValidationPipe(finalOptions);

		return (
			target: unknown,
			propertyKey: string | symbol,
			parameterIndex: number,
		) => {
			decorator(target, propertyKey, parameterIndex);
			validationPipe.transform(target, {
				type: 'param',
				metatype: String,
			});
		};
	};
}

export const ValidatedQuery = createValidationDecorator(Query);
export const ValidatedBody = createValidationDecorator(Body);
export const ValidatedParam = createValidationDecorator(Param);
