import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function mainConfig(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Delivery API')
        .setDescription('Delivery API description')
        .setVersion('1.0')
        .build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));

    app.useLogger(app.get(Logger));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true
            },
            forbidUnknownValues: true
        })
    );
}
