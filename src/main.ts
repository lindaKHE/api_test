import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);

	const options = new DocumentBuilder()
		.setTitle('API template')
		.setDescription('')
		.setVersion('1.0.0')
		.build();

	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('/', app, document);

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: {
				exposeDefaultValues: true,
				enableImplicitConversion: false,
			},
		}),
	);

	app.enableCors();
	await app.listen(PORT);
};

bootstrap()
	// eslint-disable-next-line no-console
	.then(() => console.log(`Server is running: http://localhost:${PORT}`))
	// eslint-disable-next-line no-console
	.catch((err) => console.error(err));
