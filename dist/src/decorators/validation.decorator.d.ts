import { type ValidationPipeOptions } from '@nestjs/common';
export declare const ValidatedQuery: (property?: string, options?: ValidationPipeOptions) => ParameterDecorator;
export declare const ValidatedBody: (property?: string, options?: ValidationPipeOptions) => ParameterDecorator;
export declare const ValidatedParam: (property?: string, options?: ValidationPipeOptions) => ParameterDecorator;
